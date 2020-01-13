#version 300 es
precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
// uniform sampler2D uHeightTex;

in vec3 position;
in vec2 uv;
out vec2 vUv;

void main() {
	vUv = uv;
	vec3 pos = position;
	// 1px = 1/(4*sqrt(3))
	// pos.z = pos.z - (1. - texture(uHeightTex, uv).r) * 0.1443375673;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
