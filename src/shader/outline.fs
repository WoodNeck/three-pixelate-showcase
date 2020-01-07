#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform sampler2D uDepthTex;
uniform sampler2D uPaletteTex;
uniform vec2 uInvTexSize;

in vec2 vUv;
out vec4 fragColor;

vec4 getOutlineCol() {
	vec2 topPxl = gl_FragCoord.xy + vec2(0, 1);
	vec2 top2Pxl = gl_FragCoord.xy + vec2(0, 2);

	vec2 uv = gl_FragCoord.xy * uInvTexSize;
	vec2 tUv = topPxl * uInvTexSize;
	vec2 ttUv = top2Pxl * uInvTexSize;

	vec4 texCol = texture(uTex, uv);
	float cd = texture(uDepthTex, uv).r;
	float td = texture(uDepthTex, tUv).r;
	float ttd = texture(uDepthTex, ttUv).r;

	float threshold = 0.16137430609 * 0.03333333333; // sqrt(5/3) / 8 * (30(Far), as camera is at 0)
	float diff = td - cd;
	float diff2 = ttd - td;
	float val = step(threshold, diff);
	float val2 = step(threshold, diff2);
	float isOutline = val * (1. - val2);

	vec4 outlineCol = vec4(1, 1, 1, 1);

	return (1. - isOutline) * texCol + isOutline * outlineCol;
}

vec4 palette(vec4 col) {
	vec3 mappedColors = floor(col.rgb * 15.);
	float mappedI = mappedColors.r + mappedColors.g * 16. + mappedColors.b * 16. * 16.;

	return texture(uPaletteTex, floor(vec2(mappedI / 64., mod(mappedI, 64.))) / 64., col.a);
}

void main() {
	vec4 albedo = getOutlineCol();
	fragColor = palette(albedo);
	// fragColor = albedo;
}
