#version 300 es
precision highp float;

uniform sampler2D albedoMap;
uniform sampler2D displacementMap;
uniform sampler2D aoMap;
uniform sampler2D normalMap;

in vec2 vUv;
out vec4 col;

void main() {
	col = texture(albedoMap, vUv);
}
