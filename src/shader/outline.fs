#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform sampler2D uDepthTex;
uniform sampler2D uOutlineTex;

in vec2 vUv;
out vec4 col;

void main() {
	vec4 texCol = texture(uTex, vUv);
	float depth = .5 - texture(uDepthTex, vUv).x;
	float depth2 = .5 - texture(uOutlineTex, vUv).x;
	float s = step(0.01, depth - depth2);
	col = texCol * (1. - s) + s * vec4(1, 1, 1, 1);

	float diff = depth2 - depth;
	col = vec4(depth, depth2, 0, 1);
}
