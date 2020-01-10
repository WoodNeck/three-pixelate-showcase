#version 300 es
precision highp float;

uniform sampler2D uPaletteTex;
uniform sampler2D uHeightTex;

in vec2 vUv;
out vec4 col;

vec2 getPaletteUV(vec4 col) {
	vec3 mappedColors = floor(col.rgb * 15.);
	float mappedI = mappedColors.r * 256. + mappedColors.g * 16. + mappedColors.b;
	return vec2(mod(mappedI, 64.), mappedI / 64.) / 64.;
}

void main() {
	// vec4 albedo = texture(uTex, vUv);
	// vec2 pUV = getPaletteUV(albedo);
	// col = texture(uPaletteTex, pUV);
	// col = albedo;
	col = vec4(vUv, 0, 1);
}
