#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform sampler2D uDepthTex;
uniform sampler2D uPaletteTex;
uniform vec2 uInvTexSize;

const float bayer[16] = float[16](
	 1.,  9.,  3., 11.,
	13.,  5., 15.,  7.,
	 4., 12.,  2., 10.,
	16.,  8., 14.,  6.
);

in vec2 vUv;
out vec4 fragColor;

vec4 getOutlineCol(vec4 texCol) {
	vec2 topPxl = gl_FragCoord.xy + vec2(0, 1);
	vec2 top2Pxl = gl_FragCoord.xy + vec2(0, 2);

	vec2 uv = gl_FragCoord.xy * uInvTexSize;
	vec2 tUv = topPxl * uInvTexSize;
	vec2 ttUv = top2Pxl * uInvTexSize;

	float cd = texture(uDepthTex, uv).r;
	float td = texture(uDepthTex, tUv).r;
	float ttd = texture(uDepthTex, ttUv).r;

	float threshold = 0.16137430609 * 0.03333333333; // sqrt(5/3) / 8 * (30(Far), as camera is at 0)
	float diff = td - cd;
	float diff2 = ttd - td;
	float val = step(threshold, diff);
	float val2 = step(threshold, diff2);
	float isOutline = val * (1. - val2);

	vec4 outlineCol = texture(uPaletteTex, vec2(1, 1));

	return (1. - isOutline) * texCol + isOutline * outlineCol;
}

vec2 getPaletteUV(vec4 col) {
	vec3 mappedColors = floor(col.rgb * 15.);
	float mappedI = mappedColors.r * 256. + mappedColors.g * 16. + mappedColors.b;
	return vec2(mod(mappedI, 64.), mappedI / 64.) / 64.;
}

void main() {
	vec2 uv = gl_FragCoord.xy * uInvTexSize;
	vec4 albedo = texture(uTex, uv);

	int x = int(gl_FragCoord.x) % 4;
	int y = int(gl_FragCoord.y) % 4;

	vec4 albedo_with_offset = albedo + (bayer[4*y+x] / 255.);

	vec2 pUV = getPaletteUV(albedo_with_offset);
	vec4 restricted = texture(uPaletteTex, pUV);
	fragColor = getOutlineCol(restricted);
}
