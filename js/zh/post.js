// The camera, ported from Zero Hour's HDR post chain: the world renders into a half-float target, then light
// shafts from the sun, bloom (13-tap down/up chain), eye adaptation, lens flare, ACES tone mapping and a grade.
// The scene target's alpha is an occlusion mask: 0 where open sky lets sunlight through, 1 behind anything solid.
import * as THREE from 'three';

const DEG = Math.PI / 180;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smoothR = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const PQ_VS = /* glsl */ `varying vec2 vUv;
void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4( position.xy, 0.0, 1.0 ); }`;
const PQ_FN = /* glsl */ `float lum( vec3 c ) { return dot( c, vec3( 0.2126, 0.7152, 0.0722 ) ); }
float ign( vec2 p ) { return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) ); }`;
const PQ = {
  // sky near the sun, masked by whatever stands in front of it
  rays: `${PQ_FN}
uniform sampler2D tScene; uniform vec2 uSunUV; uniform float uAspect; varying vec2 vUv;
void main() {
	vec4 s = texture2D( tScene, vUv );
	vec3 c = min( s.rgb, vec3( 60.0 ) ) * ( 1.0 - clamp( s.a, 0.0, 1.0 ) );
	vec2 d = ( vUv - uSunUV ) * vec2( uAspect, 1.0 );
	c *= smoothstep( 0.9, 4.5, lum( c ) ) * exp( - dot( d, d ) * 7.0 );
	gl_FragColor = vec4( c, 1.0 );
}`,
  // radial blur toward the sun, run twice with shrinking steps
  blur: `${PQ_FN}
uniform sampler2D tSrc; uniform vec2 uSunUV; uniform float uStep; uniform float uDecay; uniform vec2 uRes; varying vec2 vUv;
void main() {
	vec2 delta = ( uSunUV - vUv ) * uStep / 28.0;
	vec2 uv = vUv + delta * ign( vUv * uRes );
	vec3 sum = vec3( 0.0 ); float w = 1.0, ws = 0.0;
	for ( int i = 0; i < 28; i ++ ) { sum += texture2D( tSrc, uv ).rgb * w; ws += w; w *= uDecay; uv += delta; }
	gl_FragColor = vec4( sum / ws, 1.0 );
}`,
  // 13-tap downsample (Jimenez 2014); the first level uses a Karis average so one glinting pixel cannot make the bloom flicker
  down: `${PQ_FN}
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uKaris; varying vec2 vUv;
vec3 tap( vec2 o ) { return min( texture2D( tSrc, vUv + o * uTexel ).rgb, vec3( 80.0 ) ); }
float kw( vec3 c ) { return mix( 1.0, 1.0 / ( 1.0 + lum( c ) * 0.2 ), uKaris ); }
void main() {
	vec3 a = tap( vec2( -2.0, 2.0 ) ), b = tap( vec2( 0.0, 2.0 ) ), c = tap( vec2( 2.0, 2.0 ) );
	vec3 d = tap( vec2( -2.0, 0.0 ) ), e = tap( vec2( 0.0, 0.0 ) ), f = tap( vec2( 2.0, 0.0 ) );
	vec3 g = tap( vec2( -2.0, -2.0 ) ), h = tap( vec2( 0.0, -2.0 ) ), i = tap( vec2( 2.0, -2.0 ) );
	vec3 j = tap( vec2( -1.0, 1.0 ) ), k = tap( vec2( 1.0, 1.0 ) ), l = tap( vec2( -1.0, -1.0 ) ), m = tap( vec2( 1.0, -1.0 ) );
	vec3 g0 = ( a + b + d + e ) * 0.25, g1 = ( b + c + e + f ) * 0.25, g2 = ( d + e + g + h ) * 0.25, g3 = ( e + f + h + i ) * 0.25, g4 = ( j + k + l + m ) * 0.25;
	float w0 = 0.125 * kw( g0 ), w1 = 0.125 * kw( g1 ), w2 = 0.125 * kw( g2 ), w3 = 0.125 * kw( g3 ), w4 = 0.5 * kw( g4 );
	gl_FragColor = vec4( ( g0 * w0 + g1 * w1 + g2 * w2 + g3 * w3 + g4 * w4 ) / ( w0 + w1 + w2 + w3 + w4 ), 1.0 );
}`,
  up: `uniform sampler2D tSrc; uniform vec2 uTexel; varying vec2 vUv;
void main() {
	vec2 d = uTexel;
	vec3 s = texture2D( tSrc, vUv ).rgb * 4.0;
	s += ( texture2D( tSrc, vUv + vec2( -d.x, 0.0 ) ).rgb + texture2D( tSrc, vUv + vec2( d.x, 0.0 ) ).rgb + texture2D( tSrc, vUv + vec2( 0.0, -d.y ) ).rgb + texture2D( tSrc, vUv + vec2( 0.0, d.y ) ).rgb ) * 2.0;
	s += texture2D( tSrc, vUv - d ).rgb + texture2D( tSrc, vUv + vec2( d.x, -d.y ) ).rgb + texture2D( tSrc, vUv + vec2( -d.x, d.y ) ).rgb + texture2D( tSrc, vUv + d ).rgb;
	gl_FragColor = vec4( s / 16.0, 1.0 );
}`,
  // eye adaptation (center-weighted log average) plus how much of the sun disc is unobstructed, for the flare
  exposure: `${PQ_FN}
uniform sampler2D tLum; uniform sampler2D tPrev; uniform sampler2D tScene; uniform vec2 uSunUV; uniform float uSunRadius; uniform float uAspect;
uniform float uDt; uniform float uInit; uniform float uKey; uniform vec2 uRange; varying vec2 vUv;
void main() {
	float sumL = 0.0, sumW = 0.0;
	for ( int y = 0; y < 9; y ++ ) for ( int x = 0; x < 13; x ++ ) {
		vec2 uv = ( vec2( float( x ), float( y ) ) + 0.5 ) / vec2( 13.0, 9.0 );
		float l = clamp( lum( texture2D( tLum, uv ).rgb ), 1e-4, 24.0 );
		vec2 d = ( uv - vec2( 0.5, 0.46 ) ) * vec2( 1.4, 1.0 );
		float w = exp( - dot( d, d ) * 2.6 );
		sumL += log( l ) * w; sumW += w;
	}
	float avg = exp( sumL / sumW );
	float target = clamp( uKey / avg, uRange.x, uRange.y );
	float vis = 0.0;
	for ( int i = 0; i < 16; i ++ ) {
		float fi = float( i ) + 0.5, a = fi * 2.39996, r = sqrt( fi / 16.0 ) * uSunRadius;
		vis += 1.0 - clamp( texture2D( tScene, uSunUV + vec2( cos( a ) / uAspect, sin( a ) ) * r ).a, 0.0, 1.0 );
	}
	vis /= 16.0;
	vec2 prev = texture2D( tPrev, vec2( 0.5 ) ).rg;
	if ( uInit > 0.5 || !( prev.x > 0.0 ) ) prev = vec2( target, vis );
	float ke = 1.0 - exp( - uDt * ( target < prev.x ? 2.2 : 1.3 ) );
	float kv = 1.0 - exp( - uDt * 14.0 );
	gl_FragColor = vec4( exp( mix( log( max( prev.x, 1e-4 ) ), log( target ), ke ) ), mix( prev.y, vis, kv ), avg, 1.0 );
}`,
  composite: `${PQ_FN}
uniform sampler2D tScene; uniform sampler2D tBloom; uniform sampler2D tRays; uniform sampler2D tExp;
uniform vec2 uSunUV; uniform float uSunOn; uniform float uAspect; uniform float uTime; uniform float uBloom; uniform float uBloomNorm;
uniform float uRays; uniform float uFlare; uniform vec3 uSunTint; uniform vec4 uGrade; uniform float uHurt; uniform float uExpK; uniform vec4 uStorm; varying vec2 vUv;
// ACES fitted (Stephen Hill)
vec3 acesFit( vec3 c ) {
	const mat3 inM = mat3( 0.59719, 0.07600, 0.02840, 0.35458, 0.90834, 0.13383, 0.04823, 0.01566, 0.83777 );
	const mat3 outM = mat3( 1.60475, -0.10208, -0.00327, -0.53108, 1.10813, -0.07276, -0.07367, -0.00605, 1.07602 );
	c = inM * c;
	vec3 a = c * ( c + 0.0245786 ) - 0.000090537, b = c * ( 0.983729 * c + 0.4329510 ) + 0.238081;
	return clamp( outM * ( a / b ), 0.0, 1.0 );
}
vec3 toSRGB( vec3 c ) { return mix( c * 12.92, 1.055 * pow( c, vec3( 1.0 / 2.4 ) ) - 0.055, step( 0.0031308, c ) ); }
float ghost( vec2 p, vec2 c, float r ) { float d = length( p - c ); return ( 1.0 - smoothstep( r * 0.5, r, d ) ) * ( 0.5 + 0.5 * smoothstep( r * 0.3, r, d ) ); }
// display-referred: 1.0 is near white after the tone curve
vec3 lensFlare( vec2 uv ) {
	vec2 asp = vec2( uAspect, 1.0 ), p = ( uv - 0.5 ) * asp, s = ( uSunUV - 0.5 ) * asp;
	vec3 f = vec3( 1.0, 0.62, 0.3 ) * ghost( p, s * -0.24, 0.05 ) * 0.1;
	f += vec3( 0.55, 0.85, 0.5 ) * ghost( p, s * -0.5, 0.1 ) * 0.045;
	f += vec3( 0.85, 0.45, 0.85 ) * ghost( p, s * -0.8, 0.06 ) * 0.07;
	f += vec3( 0.35, 0.6, 1.0 ) * ghost( p, s * -1.2, 0.2 ) * 0.03;
	f += vec3( 1.0, 0.8, 0.5 ) * ghost( p, s * 0.45, 0.03 ) * 0.09;
	float ring = length( p + s * 0.9 );
	f += vec3( 0.6, 0.75, 1.0 ) * smoothstep( 0.03, 0.0, abs( ring - 0.42 ) ) * 0.035;   // faint halo ring
	vec2 d = p - s; float r = length( d ), ang = atan( d.y, d.x );
	// glare: a white-hot bloom near the sun, fading into warm haze
	f += uSunTint * ( 2.4 * exp( - r * 15.0 ) + 0.42 * exp( - r * 5.5 ) + 0.08 * exp( - r * 1.8 ) );
	// starburst: long thin spikes, shimmering a little
	float burst = pow( abs( cos( ang * 3.0 + 0.4 ) ), 80.0 ) + 0.7 * pow( abs( cos( ang * 4.0 + 1.3 ) ), 120.0 ) + 0.35 * pow( abs( cos( ang * 9.0 + uTime * 0.05 ) ), 40.0 );
	f += uSunTint * burst * ( exp( - r * 4.5 ) * 0.55 + exp( - r * 14.0 ) * 0.6 );
	f += uSunTint * exp( - abs( d.y ) * 220.0 ) * exp( - abs( d.x ) * 1.9 ) * 0.28;   // thin anamorphic streak
	return f;
}
void main() {
	vec2 uv = vUv;
	vec2 dc = uv - 0.5;
	float ca = dot( dc, dc ) * 0.0065;   // a whisper of chromatic aberration toward the edges
	vec3 col = vec3( texture2D( tScene, uv - dc * ca ).r, texture2D( tScene, uv ).g, texture2D( tScene, uv + dc * ca ).b );
	col = mix( min( col, vec3( 400.0 ) ), texture2D( tBloom, uv ).rgb * uBloomNorm, uBloom );
	col += texture2D( tRays, uv ).rgb * uRays;
	vec3 ex = texture2D( tExp, vec2( 0.5 ) ).rgb;
	float sunVis = ex.g * uSunOn;
	col *= ex.r * uExpK;
	col += lensFlare( uv ) * uFlare * sunVis;
	col += uSunTint * 0.035 * sunVis * min( uFlare, 1.0 );   // veiling glare: staring into the sun lifts the blacks, as a real lens does
	col = acesFit( col );
	// grade: lifted shadows, creamy highlights; hurt drains the color; inside the storm everything goes violet
	float l = lum( col );
	col += vec3( 0.016, 0.011, 0.006 ) * ( 1.0 - smoothstep( 0.0, 0.3, l ) ) * uGrade.y;
	col *= mix( vec3( 1.0 ), mix( vec3( 1.05, 0.98, 0.9 ), vec3( 1.02, 1.0, 0.97 ), smoothstep( 0.05, 0.7, l ) ), uGrade.y );
	col = max( mix( vec3( l ), col, uGrade.x * ( 1.0 - 0.65 * uHurt ) ), 0.0 );
	col = mix( col, col * vec3( 0.75, 0.55, 1.15 ) + vec3( 0.06, 0.0, 0.1 ), uStorm.x );
	vec3 o = toSRGB( col );
	vec2 q = dc * vec2( uAspect, 1.0 );
	o *= mix( 1.0, 1.0 - smoothstep( 0.2, 1.2, length( q ) ), 0.5 );
	o += ( ign( gl_FragCoord.xy + fract( uTime * 7.3 ) * 113.0 ) - 0.5 ) * ( 2.0 / 255.0 );   // grain and dither against banding
	gl_FragColor = vec4( o, 1.0 );
}`,
};

const GFXQ = {
  high: { pr: 1.5, mp: 2.6, msaa: 4, bloom: 6, rays: 1 },
  medium: { pr: 1.1, mp: 1.8, msaa: 2, bloom: 5, rays: 1 },
  low: { pr: 0.8, mp: 1.1, msaa: 0, bloom: 4, rays: 0 },
};

export function hdrSupported(renderer) {
  try {
    const gl = renderer.getContext();
    return !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
  } catch {
    return false;
  }
}

export class PostChain {
  constructor(renderer) {
    this.renderer = renderer;
    this.quality = 'medium';
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    this.quad = new THREE.Mesh(g);
    this.quad.frustumCulled = false;
    this.qs = new THREE.Scene();
    this.qs.add(this.quad);
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const V2 = () => new THREE.Vector2();
    const mat = (fs, u, x) => new THREE.ShaderMaterial({ vertexShader: PQ_VS, fragmentShader: fs, uniforms: u, depthTest: false, depthWrite: false, ...(x || {}) });
    this.m = {
      rays: mat(PQ.rays, { tScene: { value: null }, uSunUV: { value: V2() }, uAspect: { value: 1 } }),
      blur: mat(PQ.blur, { tSrc: { value: null }, uSunUV: { value: V2() }, uStep: { value: 1 }, uDecay: { value: 0.96 }, uRes: { value: V2() } }),
      down: mat(PQ.down, { tSrc: { value: null }, uTexel: { value: V2() }, uKaris: { value: 0 } }),
      up: mat(PQ.up, { tSrc: { value: null }, uTexel: { value: V2() } }, { blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor }),
      exposure: mat(PQ.exposure, {
        tLum: { value: null }, tPrev: { value: null }, tScene: { value: null }, uSunUV: { value: V2() }, uSunRadius: { value: 0.02 }, uAspect: { value: 1 }, uDt: { value: 0 }, uInit: { value: 1 },
        uKey: { value: 0.3 }, uRange: { value: new THREE.Vector2(0.06, 2.2) },
      }),
      composite: mat(PQ.composite, {
        tScene: { value: null }, tBloom: { value: null }, tRays: { value: null }, tExp: { value: null }, uSunUV: { value: V2() }, uSunOn: { value: 0 }, uAspect: { value: 1 }, uTime: { value: 0 },
        uBloom: { value: 0.075 }, uBloomNorm: { value: 1 }, uRays: { value: 0.6 }, uFlare: { value: 1 }, uSunTint: { value: new THREE.Vector3(1, 0.85, 0.65) },
        uGrade: { value: new THREE.Vector4(1.1, 1, 0, 0) }, uHurt: { value: 0 }, uExpK: { value: 1 }, uStorm: { value: new THREE.Vector4() },
      }),
    };
    this.T = null;
    this.all = null;
    this.exp = null;
    this.ei = 0;
    this.key = '';
    this.time = 0;
    this.init = true;
    this.raysLive = true;
    this.w = 2;
    this.h = 2;
    this.fwd = new THREE.Vector3();
    this.ndc = new THREE.Vector3();
  }

  setAtmos(A) {
    this.m.exposure.uniforms.uKey.value = A.key;
    this.m.composite.uniforms.uGrade.value.set(A.sat, A.warm, 0, 0);
    this.init = true;
  }

  setQuality(q) {
    this.quality = GFXQ[q] ? q : 'medium';
  }

  get target() {
    this.resize();
    return this.T.scene;
  }

  resize() {
    const r = this.renderer, q = GFXQ[this.quality];
    const sz = r.getDrawingBufferSize(new THREE.Vector2()), w = Math.max(2, sz.x | 0), h = Math.max(2, sz.y | 0);
    const key = w + 'x' + h + '/' + q.msaa + '/' + q.bloom;
    if (key === this.key) return;
    this.key = key;
    if (this.all) for (const t of this.all) t.dispose();
    const o = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false };
    const RT = (ww, hh, x) => new THREE.WebGLRenderTarget(ww, hh, { ...o, ...(x || {}) });
    const sc = RT(w, h, { depthBuffer: true, samples: q.msaa });
    const hw = Math.max(1, w >> 1), hh = Math.max(1, h >> 1), bloom = [];
    let bw = w, bh = h;
    for (let i = 0; i < q.bloom; i++) {
      bw = Math.max(1, bw >> 1);
      bh = Math.max(1, bh >> 1);
      bloom.push(RT(bw, bh));
    }
    if (!this.exp) this.exp = [0, 1].map(() => RT(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter }));
    this.T = { scene: sc, raysA: RT(hw, hh), raysB: RT(hw, hh), bloom };
    this.all = [sc, this.T.raysA, this.T.raysB, ...bloom];
    this.w = w;
    this.h = h;
    this.m.blur.uniforms.uRes.value.set(hw, hh);
    this.m.composite.uniforms.uBloomNorm.value = 1 / q.bloom;
  }

  pass(m, target) {
    this.quad.material = m;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.qs, this.cam);
  }

  // cam: the world camera; sunDir: unit vector toward the sun; o: { dt, hurt (0..1), storm (0..1) }
  render(cam, sunDir, o) {
    const T = this.T, m = this.m, aspect = this.w / this.h, r = this.renderer, dt = o.dt || 0.016;
    this.time += dt;
    // where is the sun on screen, and is it in front of us at all?
    cam.getWorldDirection(this.fwd);
    const facing = this.fwd.dot(sunDir);
    this.ndc.copy(cam.position).addScaledVector(sunDir, 500).project(cam);
    const sx = this.ndc.x * 0.5 + 0.5, sy = this.ndc.y * 0.5 + 0.5, edge = Math.max(Math.abs(this.ndc.x), Math.abs(this.ndc.y));
    const sunOn = facing > 0 ? smoothR(-0.05, 0.3, facing) * (1 - smoothR(1, 1.9, edge)) : 0;
    if (GFXQ[this.quality].rays && sunOn > 0.001) {
      m.rays.uniforms.tScene.value = T.scene.texture;
      m.rays.uniforms.uSunUV.value.set(sx, sy);
      m.rays.uniforms.uAspect.value = aspect;
      this.pass(m.rays, T.raysA);
      const b = m.blur.uniforms;
      b.uSunUV.value.set(sx, sy);
      b.tSrc.value = T.raysA.texture;
      b.uStep.value = 0.92;
      b.uDecay.value = 0.965;
      this.pass(m.blur, T.raysB);
      b.tSrc.value = T.raysB.texture;
      b.uStep.value = 0.07;
      b.uDecay.value = 1;
      this.pass(m.blur, T.raysA);
      this.raysLive = true;
    } else if (this.raysLive) {
      r.setRenderTarget(T.raysA);
      r.clear(true, false, false);
      this.raysLive = false;
    }
    let src = T.scene;
    for (let i = 0; i < T.bloom.length; i++) {
      const d = m.down.uniforms;
      d.tSrc.value = src.texture;
      d.uTexel.value.set(1 / src.width, 1 / src.height);
      d.uKaris.value = i === 0 ? 1 : 0;
      this.pass(m.down, T.bloom[i]);
      src = T.bloom[i];
    }
    const prev = this.exp[this.ei], next = this.exp[1 - this.ei], e = m.exposure.uniforms;
    e.tLum.value = T.bloom[Math.min(3, T.bloom.length - 1)].texture;
    e.tPrev.value = prev.texture;
    e.tScene.value = T.scene.texture;
    e.uSunUV.value.set(sx, sy);
    e.uSunRadius.value = (0.0155 / Math.tan((cam.fov * DEG) / 2)) * 0.5 * 1.6;
    e.uAspect.value = aspect;
    e.uDt.value = Math.min(dt, 0.1);
    e.uInit.value = this.init ? 1 : 0;
    this.pass(m.exposure, next);
    this.ei = 1 - this.ei;
    this.init = false;
    for (let i = T.bloom.length - 1; i > 0; i--) {
      const u = m.up.uniforms;
      u.tSrc.value = T.bloom[i].texture;
      u.uTexel.value.set(1 / T.bloom[i].width, 1 / T.bloom[i].height);
      this.pass(m.up, T.bloom[i - 1]);
    }
    const c = m.composite.uniforms;
    c.tScene.value = T.scene.texture;
    c.tBloom.value = T.bloom[0].texture;
    c.tRays.value = T.raysA.texture;
    c.tExp.value = next.texture;
    c.uSunUV.value.set(sx, sy);
    c.uSunOn.value = sunOn;
    c.uAspect.value = aspect;
    c.uTime.value = this.time;
    c.uHurt.value = o.hurt || 0;
    c.uStorm.value.x += ((o.storm || 0) - c.uStorm.value.x) * Math.min(1, dt * 3);
    r.setRenderTarget(null);
    this.pass(m.composite, null);
  }
}
