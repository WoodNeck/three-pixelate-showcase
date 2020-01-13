#version 300 es
precision highp float;

uniform sampler2D uTex;

in vec2 vUv;
out vec4 col;

void main() {
	col = texture(uTex, vUv);
}
