#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform sampler2D uDepthTex;
uniform vec2 uTexSize;

in vec2 vUv;
out vec4 col;

void main() {
	vec2 btmPxl = vec2(gl_FragCoord.x, gl_FragCoord.y - 1.);
	vec2 uv = gl_FragCoord.xy / uTexSize.xy;
	vec2 bUv = btmPxl / uTexSize.xy;

	vec4 texCol = texture(uTex, uv);
	float belCol = texture(uDepthTex, uv).r;
	float belCol2 = texture(uDepthTex, bUv).r;

	float threshold = 0.16137430609 / 1000.; // sqrt(5/3) / 8 * (1000(Far), as camera is at 0)
	float diff = belCol - belCol2;
	float val = step(threshold, diff);

	vec4 outlineCol = vec4(1, 1, 1, 1);

	col = (1. - val) * texCol + val * outlineCol;
}
