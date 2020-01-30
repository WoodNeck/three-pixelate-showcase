#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;

uniform sampler2D displacementMap;

in vec3 position;
in vec3 normal;
in vec2 uv;

out vec2 vUv;
out vec3 vNormal;

void main() {
	vUv = uv;

	vec3 displacement = texture(displacementMap, uv).rgb;
	vec3 pos = position; // + normal * displacement.r * 0.14433756729;

	vNormal = normalMatrix * normal;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}
