#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform sampler2D uDepthTex;
uniform sampler2D uOutlineTex;

in vec2 vUv;
out vec4 col;

void main() {
	vec4 texCol = texture(uTex, vUv);
	float belCol = texture(uDepthTex, vUv).r;
	float belCol2 = texture(uDepthTex, vUv - vec2(0, 0.006)).r;

	float threshold = 0.0002;
	float diff = belCol - belCol2;
	float val = step(threshold, diff);

	col = (1. - val) * texCol + val * vec4(1, 1, 1, 1);
}
