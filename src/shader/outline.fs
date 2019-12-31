#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform sampler2D uDepthTex;

in vec2 vUv;
out vec4 col;

void main() {
	vec4 texCol = texture(uTex, vUv);
	float depth = texture(uDepthTex, vUv).x;
	float depth2 = texture(uDepthTex, vUv - vec2(0, 0.003)).x;
	float s = step(0.1, depth - depth2);
	col = texCol * (1. - s) + s * vec4(1, 1, 1, 1);
}
