#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform sampler2D uDepthTex;
uniform sampler2D uPaletteTex;
uniform sampler2D uDitherTex;
uniform vec2 uInvTexSize;

const float threshold[16] = float[16](
	1./16., 9./16., 3./16., 11./16.,
	13./16., 5./16., 15./16., 7./16.,
	4./16., 12./16., 2./16., 10./16.,
	16./16., 8./16., 14./16., 6./16.
);

in vec2 vUv;
out vec4 fragColor;

float findClosest(int x, int y, float v) {
	return step(threshold[4*y+x],v);
}

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

	vec4 outlineCol = vec4(1, 1, 1, 1);

	return (1. - isOutline) * texCol + isOutline * outlineCol;
}

vec2 getPaletteUV(vec4 col) {
	vec3 mappedColors = floor(col.rgb * 15.);
	float mappedI = mappedColors.r * 256. + mappedColors.g * 16. + mappedColors.b;
	return vec2(mod(mappedI, 64.), mappedI / 64.) / 64.;
}

void main() {
	vec2 uv = gl_FragCoord.xy * uInvTexSize;
	vec4 texCol = texture(uTex, uv);

	vec4 albedo = getOutlineCol(texCol);
	vec2 pUV = getPaletteUV(albedo);

	vec4 nearest = texture(uPaletteTex, pUV);
	vec4 second = texture(uDitherTex, pUV);

	int x = int(gl_FragCoord.x) % 4;
	int y = int(gl_FragCoord.y) % 4;

	float diff = length(texCol - nearest);
	float sw = findClosest(x, y, diff);

	fragColor = sw * second + (1. - sw) * nearest;
}
