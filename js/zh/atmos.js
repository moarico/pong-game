// The light pass ported from Zero Hour: a sky shader (blue overhead, a big soft sun, fbm cloud banks lit from
// behind), height fog that turns warm toward the sun, and the sky captured into an environment map so it
// lights and reflects off everything. Values are linear HDR; the camera (post.js) exposes and tone maps them.
import * as THREE from 'three';

// Shared haze uniforms. Plain objects (not Vector3) on purpose: three.js copies them by reference when it
// clones a material's uniforms, so every material sees updates without being touched.
export const ATM = {
  sun: { x: 0.45, y: 0.7, z: 0.32 },
  col: { x: 1.05, y: 1.25, z: 1.6 },
  sunCol: { x: 2.6, y: 2.2, z: 1.6 },
  p: { x: 0.0009, y: 1 / 80, z: 0, w: 0.92 },
  cam: { x: 0, y: 2, z: 0 },
};
for (const k in THREE.ShaderLib) {
  const u = THREE.ShaderLib[k].uniforms;
  u.zhSunDir = { value: ATM.sun };
  u.zhFogCol = { value: ATM.col };
  u.zhFogSun = { value: ATM.sunCol };
  u.zhFogP = { value: ATM.p };
  u.zhCamPos = { value: ATM.cam };
}

export const HAZE_GLSL = /* glsl */ `
vec3 zhHaze( vec3 v ) {
	float s = dot( v, zhSunDir );
	vec3 c = mix( zhFogCol, zhFogSun, pow( s * 0.5 + 0.5, 6.0 ) );
	return c + zhFogSun * 0.45 * pow( max( s, 0.0 ), 24.0 );
}
float zhFog( vec3 wp ) {
	vec3 d = wp - zhCamPos;
	float k = zhFogP.y;
	float ky = k * d.y;
	float a = zhFogP.x * exp( - k * ( zhCamPos.y - zhFogP.z ) );
	float t = abs( ky ) > 1e-4 ? ( 1.0 - exp( - ky ) ) / ky : 1.0;
	return min( 1.0 - exp( - a * length( d ) * max( t, 0.0 ) ), zhFogP.w );
}`;

// Height fog replaces three.js fog in every built-in material.
THREE.ShaderChunk.fog_pars_vertex = '#ifdef USE_FOG\nvarying vec3 vFogWorld;\n#endif';
THREE.ShaderChunk.fog_vertex = '#ifdef USE_FOG\n#ifdef USE_INSTANCING\nvFogWorld = ( modelMatrix * instanceMatrix * vec4( transformed, 1.0 ) ).xyz;\n#else\nvFogWorld = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;\n#endif\n#endif';
// sprites have no per-vertex position of their own: their haze is taken at the center
THREE.ShaderLib.sprite.vertexShader = THREE.ShaderLib.sprite.vertexShader.replace('#include <fog_vertex>', '#ifdef USE_FOG\nvFogWorld = modelMatrix[ 3 ].xyz;\n#endif');
THREE.ShaderLib.points.vertexShader = THREE.ShaderLib.points.vertexShader.replace('#include <fog_vertex>', '#ifdef USE_FOG\nvFogWorld = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;\n#endif');
THREE.ShaderChunk.fog_pars_fragment = '#ifdef USE_FOG\nvarying vec3 vFogWorld;\nuniform vec3 zhSunDir;\nuniform vec3 zhFogCol;\nuniform vec3 zhFogSun;\nuniform vec4 zhFogP;\nuniform vec3 zhCamPos;\n' + HAZE_GLSL + '\n#endif';
// additive glows just fade with distance; everything else melts into the haze color
THREE.ShaderChunk.fog_fragment = /* glsl */ `#ifdef USE_FOG
	float zhF = zhFog( vFogWorld );
	#ifdef ZH_ADD
		gl_FragColor.rgb *= 1.0 - zhF;
	#else
		vec3 zhH = zhHaze( normalize( vFogWorld - zhCamPos ) );
		#if defined( TONE_MAPPING )
			zhH = toneMapping( zhH );
		#endif
		gl_FragColor.rgb = mix( gl_FragColor.rgb, linearToOutputTexel( vec4( zhH, 1.0 ) ).rgb, zhF );
	#endif
#endif`;

const SKY_VS = /* glsl */ `varying vec3 vDir;
void main() {
	vDir = position;
	vec4 p = projectionMatrix * vec4( ( modelViewMatrix * vec4( position, 0.0 ) ).xyz, 1.0 );
	gl_Position = vec4( p.xy, p.w * 0.999999, p.w );   // pinned to the far plane: drawn only where nothing else is
}`;
const SKY_FS = /* glsl */ `uniform vec3 zhSunDir;
uniform vec3 zhFogCol;
uniform vec3 zhFogSun;
uniform vec4 zhFogP;
uniform vec3 zhCamPos;
uniform vec3 uSunCol;
uniform vec3 uZen;
uniform vec3 uZenSun;
uniform vec2 uCloudOff;
uniform vec4 uCloud;
uniform float uDisk;
uniform vec4 uGround;
uniform vec4 uStorm;
varying vec3 vDir;
float h12( vec2 p ) { vec3 p3 = fract( vec3( p.xyx ) * 0.1031 ); p3 += dot( p3, p3.yzx + 33.33 ); return fract( ( p3.x + p3.y ) * p3.z ); }
float vn( vec2 p ) { vec2 i = floor( p ), f = fract( p ), u = f * f * ( 3.0 - 2.0 * f );
	return mix( mix( h12( i ), h12( i + vec2( 1.0, 0.0 ) ), u.x ), mix( h12( i + vec2( 0.0, 1.0 ) ), h12( i + vec2( 1.0, 1.0 ) ), u.x ), u.y ); }
float fbm( vec2 p ) { float s = 0.0, a = 0.5; mat2 m = mat2( 1.6, 1.2, -1.2, 1.6 );
	for ( int i = 0; i < 5; i ++ ) { s += a * vn( p ); p = m * p + vec2( 1.7, 9.2 ); a *= 0.5; } return s; }
float cloudDensity( vec2 p ) { return smoothstep( 0.47, 0.82, fbm( p ) + ( vn( p * 0.18 + 3.1 ) - 0.5 ) * 0.35 + uCloud.x ); }
${HAZE_GLSL}
void main() {
	vec3 v = normalize( vDir );
	vec3 hz = zhHaze( v );
	if ( v.y < 0.0 ) {
		// below the horizon: haze, or while the environment is being captured, sunlit ground bouncing light back up
		gl_FragColor = vec4( mix( hz, uGround.rgb, uGround.a * smoothstep( 0.0, -0.12, v.y ) ), 1.0 );
	} else {
		float s = dot( v, zhSunDir ), sc = max( s, 0.0 ), s01 = s * 0.5 + 0.5;
		vec3 zen = mix( uZen, uZenSun, pow( s01, 5.0 ) );
		vec3 col = mix( hz, zen, pow( smoothstep( 0.0, 1.0, v.y ), 0.5 ) );
		// Mie scattering in the haze: a wide, soft glow around the sun
		col += uSunCol * ( 0.08 * pow( sc, 3.0 ) + 0.42 * pow( sc, 18.0 ) + 1.5 * pow( sc, 160.0 ) + 4.0 * pow( sc, 1400.0 ) );
		float ang = acos( clamp( s, -1.0, 1.0 ) );
		// the disc: a white-hot core, limb-darkened to gold at the rim, with a soft edge
		float disk = 1.0 - smoothstep( 0.0105, 0.0155, ang );
		col += mix( vec3( 1.0, 0.72, 0.42 ), vec3( 1.0, 0.95, 0.86 ), smoothstep( 0.0155, 0.0, ang ) ) * disk * uDisk;
		// soft cloud banks: blue-grey in shade, warm white where lit
		vec2 p = v.xz / ( v.y + 0.1 ) * 1.4 + uCloudOff;
		float d = cloudDensity( p ) * smoothstep( 0.0, 0.16, v.y ), a = 0.0;
		if ( d > 0.002 ) {
			float lt = exp( - cloudDensity( p + normalize( zhSunDir.xz ) * 0.2 ) * 1.3 );
			vec3 shade = mix( vec3( 1.0, 1.08, 1.28 ), vec3( 1.5, 1.35, 1.15 ), pow( s01, 4.0 ) );
			vec3 lit = mix( vec3( 2.3, 2.25, 2.2 ), vec3( 3.6, 3.1, 2.4 ), pow( s01, 4.0 ) );
			vec3 cc = mix( shade, lit, lt ) * uCloud.z;
			cc += zhFogSun * ( pow( sc, 8.0 ) * 0.8 + pow( sc, 50.0 ) * 3.0 ) * ( 1.0 - d );
			a = d * uCloud.y;
			col = mix( col, cc, a );
		}
		// the storm tints the sky purple where it stands
		col = mix( col, col * vec3( 0.55, 0.35, 0.95 ) + vec3( 0.12, 0.04, 0.22 ), uStorm.x * smoothstep( 0.5, 0.0, v.y ) );
		// alpha carries occlusion for the light shafts: open sky lets the sun through
		gl_FragColor = vec4( col, a );
	}
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`;

// A clear island day: high sun a little warm, deep blue overhead, pale blue haze, scattered cumulus.
export const DAY = {
  el: 41, az: 125,
  sun: [1, 0.9, 0.78], sunI: 3.6,
  zen: [0.16, 0.4, 1.25], zenSun: [0.85, 0.95, 1.15],
  fog: [0.62, 0.86, 1.32], fogSun: [2.2, 1.95, 1.5],
  dens: 0.00045, fall: 1 / 70, fmax: 0.85,
  cloud: [0.04, 0.92, 1.0, 0], ground: [0.2, 0.2, 0.15], disk: 150,
  key: 0.32, sat: 1.08, warm: 1.0,
};

export class Atmosphere {
  constructor(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.sunDir = new THREE.Vector3();
    this.A = DAY;
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        zhSunDir: { value: ATM.sun }, zhFogCol: { value: ATM.col }, zhFogSun: { value: ATM.sunCol }, zhFogP: { value: ATM.p }, zhCamPos: { value: ATM.cam },
        uSunCol: { value: new THREE.Vector3(4, 3, 2) }, uZen: { value: new THREE.Vector3() }, uZenSun: { value: new THREE.Vector3() },
        uCloudOff: { value: new THREE.Vector2(0.3, 1.7) }, uCloud: { value: new THREE.Vector4() }, uDisk: { value: 70 }, uGround: { value: new THREE.Vector4() },
        uStorm: { value: new THREE.Vector4() },
      },
      vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false, fog: false,
    });
    const g = new THREE.SphereGeometry(1, 64, 32);
    this.mesh = new THREE.Mesh(g, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 50; // after the opaque world, so clouds shade only visible sky
    scene.add(this.mesh);
    this.envScene = new THREE.Scene();
    const em = new THREE.Mesh(g, this.mat);
    em.frustumCulled = false;
    this.envScene.add(em);
    this.pmrem = null;
    this.envRT = null;
    // FogExp2 only switches the haze chunks on; its own color and density are unused
    scene.fog = new THREE.FogExp2(0xffffff, 0.001);
  }

  // Sets the sun, sky and haze; returns the sun direction. Lights are given to set their color and strength.
  set(A, sunLight, hemi) {
    this.A = A;
    const DEG = Math.PI / 180, el = A.el * DEG, az = A.az * DEG;
    this.sunDir.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).normalize();
    const v3 = (o, a) => {
      o.x = a[0];
      o.y = a[1];
      o.z = a[2];
    };
    v3(ATM.sun, [this.sunDir.x, this.sunDir.y, this.sunDir.z]);
    v3(ATM.col, A.fog);
    v3(ATM.sunCol, A.fogSun);
    ATM.p.x = A.dens;
    ATM.p.y = A.fall;
    ATM.p.z = 0;
    ATM.p.w = A.fmax;
    if (sunLight) {
      sunLight.color.setRGB(A.sun[0], A.sun[1], A.sun[2]);
      sunLight.intensity = A.sunI;
    }
    if (hemi) {
      hemi.color.setRGB(A.zen[0], A.zen[1], A.zen[2]);
      hemi.groundColor.setRGB(A.ground[0] * 2, A.ground[1] * 2, A.ground[2] * 2);
    }
    const u = this.mat.uniforms;
    u.uSunCol.value.set(A.sun[0], A.sun[1], A.sun[2]).multiplyScalar(A.sunI * 1.2);
    u.uZen.value.set(A.zen[0], A.zen[1], A.zen[2]);
    u.uZenSun.value.set(A.zenSun[0], A.zenSun[1], A.zenSun[2]);
    u.uCloud.value.set(A.cloud[0], A.cloud[1], A.cloud[2], A.cloud[3]);
    u.uDisk.value = A.disk;
    u.uGround.value.set(A.ground[0], A.ground[1], A.ground[2], 0);
    return this.sunDir;
  }

  // The sky becomes the world's ambient light and reflections: a prefiltered environment map of the sky shader.
  buildEnv() {
    const r = this.renderer;
    if (!this.pmrem) this.pmrem = new THREE.PMREMGenerator(r);
    const u = this.mat.uniforms, disk = u.uDisk.value, prev = r.getRenderTarget();
    u.uDisk.value = Math.min(disk, 20);
    u.uGround.value.w = 1;
    const rt = this.pmrem.fromScene(this.envScene, 0, 0.1, 100);
    u.uDisk.value = disk;
    u.uGround.value.w = 0;
    r.setRenderTarget(prev);
    if (this.envRT) this.envRT.dispose();
    this.envRT = rt;
    this.scene.environment = rt.texture;
    return rt.texture;
  }

  update(dt, camera, storm = 0) {
    this.mesh.position.copy(camera.position);
    this.mesh.scale.setScalar(camera.far * 0.5);
    ATM.cam.x = camera.position.x;
    ATM.cam.y = camera.position.y;
    ATM.cam.z = camera.position.z;
    const u = this.mat.uniforms;
    u.uCloudOff.value.x -= dt * 0.0016;
    u.uCloudOff.value.y -= dt * 0.0009;
    u.uStorm.value.x += (storm - u.uStorm.value.x) * Math.min(1, dt * 2);
  }
}
