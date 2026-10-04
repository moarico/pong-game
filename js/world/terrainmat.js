// Terrain material: a standard PBR material whose vertex color (the biome palette) is multiplied by detail
// textures picked per vertex (two vec4 splat weights). Each texture is sampled at two scales so it does not
// visibly tile, rock is projected three ways on cliffs, and a slow world-space noise varies the color.
import * as THREE from 'three';
import { groundTextures } from './groundtex.js';

const VERT_PARS = /* glsl */ `
attribute vec4 aSplat0;
attribute vec4 aSplat1;
varying vec4 vSplat0;
varying vec4 vSplat1;
varying vec3 vTWorld;
varying vec3 vTNorm;
`;
const VERT_MAIN = /* glsl */ `
vSplat0 = aSplat0;
vSplat1 = aSplat1;
vTWorld = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
vTNorm = normalize( mat3( modelMatrix ) * objectNormal );
`;
const FRAG_PARS = /* glsl */ `
uniform sampler2D tG0;
uniform sampler2D tG1;
uniform sampler2D tG2;
uniform sampler2D tG3;
uniform sampler2D tG4;
uniform sampler2D tG5;
uniform sampler2D tG6;
uniform sampler2D tG7;
varying vec4 vSplat0;
varying vec4 vSplat1;
varying vec3 vTWorld;
varying vec3 vTNorm;
float tH( vec2 p ) { vec3 p3 = fract( vec3( p.xyx ) * 0.1031 ); p3 += dot( p3, p3.yzx + 33.33 ); return fract( ( p3.x + p3.y ) * p3.z ); }
float tN( vec2 p ) { vec2 i = floor( p ), f = fract( p ), u = f * f * ( 3.0 - 2.0 * f );
	return mix( mix( tH( i ), tH( i + vec2( 1.0, 0.0 ) ), u.x ), mix( tH( i + vec2( 0.0, 1.0 ) ), tH( i + vec2( 1.0, 1.0 ) ), u.x ), u.y ); }
// a detail map at its own scale, modulated by itself at a much larger scale so repeats do not line up
vec3 tDet( sampler2D t, vec2 uv ) {
	vec3 a = texture2D( t, uv ).rgb * 2.0;
	float b = texture2D( t, uv * 0.161 + vec2( 0.37, 0.71 ) ).g;
	return a * ( 0.78 + 0.44 * b );
}
vec3 tRock( vec3 p, vec3 n ) {
	vec3 w = pow( abs( n ), vec3( 4.0 ) ); w /= ( w.x + w.y + w.z );
	vec3 c = vec3( 0.0 );
	if ( w.x > 0.01 ) c += w.x * tDet( tG4, p.zy / 7.0 );
	if ( w.y > 0.01 ) c += w.y * tDet( tG4, p.xz / 7.0 );
	if ( w.z > 0.01 ) c += w.z * tDet( tG4, p.xy / 7.0 );
	return c;
}
vec3 groundDetail() {
	vec2 w = vTWorld.xz;
	vec3 c = vec3( 0.0 );
	if ( vSplat0.x > 0.01 ) c += vSplat0.x * tDet( tG0, w / 3.5 );
	if ( vSplat0.y > 0.01 ) c += vSplat0.y * tDet( tG1, w / 4.5 );
	if ( vSplat0.z > 0.01 ) c += vSplat0.z * tDet( tG2, w / 4.0 );
	if ( vSplat0.w > 0.01 ) c += vSplat0.w * tDet( tG3, w / 4.0 );
	if ( vSplat1.x > 0.01 ) c += vSplat1.x * tRock( vTWorld, normalize( vTNorm ) );
	if ( vSplat1.y > 0.01 ) c += vSplat1.y * tDet( tG5, w / 6.0 );
	if ( vSplat1.z > 0.01 ) c += vSplat1.z * tDet( tG6, w / 7.0 );
	if ( vSplat1.w > 0.01 ) c += vSplat1.w * tDet( tG7, w / 8.0 );
	float total = dot( vSplat0, vec4( 1.0 ) ) + dot( vSplat1, vec4( 1.0 ) );
	c /= max( total, 1e-3 );
	// big slow patches of lighter and darker ground
	float m = tN( w / 160.0 ) * 0.6 + tN( w / 41.0 + 7.3 ) * 0.4;
	return c * ( 0.86 + 0.28 * m );
}
`;

export function terrainMaterial() {
  const tex = groundTextures();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.94, metalness: 0 });
  mat.onBeforeCompile = (sh) => {
    for (let i = 0; i < 8; i++) sh.uniforms['tG' + i] = { value: tex[i] };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n' + VERT_PARS)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + VERT_MAIN);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + FRAG_PARS)
      .replace('#include <color_fragment>', '#include <color_fragment>\n\tdiffuseColor.rgb *= groundDetail();');
  };
  mat.customProgramCacheKey = () => 'stormdrop-terrain';
  return mat;
}

// Boulders and cliffs: the rock detail projected three ways in world space over the vertex/instance color.
export function rockMaterial() {
  const tex = groundTextures();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0 });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.tG4 = { value: tex[4] };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRW;\nvarying vec3 vRN;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
	{
		vec4 rw = vec4( transformed, 1.0 );
		mat3 rm = mat3( modelMatrix );
		#ifdef USE_INSTANCING
			rw = instanceMatrix * rw;
			rm = rm * mat3( instanceMatrix );
		#endif
		vRW = ( modelMatrix * rw ).xyz;
		vRN = normalize( rm * objectNormal );
	}`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
uniform sampler2D tG4;
varying vec3 vRW;
varying vec3 vRN;
vec3 rDet( vec2 uv ) { return texture2D( tG4, uv ).rgb * 2.0 * ( 0.8 + 0.4 * texture2D( tG4, uv * 0.17 + 0.3 ).g ); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
	{
		vec3 w = pow( abs( normalize( vRN ) ), vec3( 4.0 ) ); w /= ( w.x + w.y + w.z );
		vec3 d = w.x * rDet( vRW.zy / 4.0 ) + w.y * rDet( vRW.xz / 4.0 ) + w.z * rDet( vRW.xy / 4.0 );
		diffuseColor.rgb *= d;
	}`);
  };
  mat.customProgramCacheKey = () => 'stormdrop-rock';
  return mat;
}
