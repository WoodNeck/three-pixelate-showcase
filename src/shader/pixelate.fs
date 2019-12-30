#version 300 es
precision highp float;

uniform sampler2D uTex;
const float[16] threshold = float[16](
	1./16., 9./16., 3./16., 11./16.,
	13./16., 5./16., 15./16., 7./16.,
	4./16., 12./16., 2./16., 10./16.,
	16./16., 8./16., 14./16., 6./16.
);

in vec2 vUv;
out vec4 fragColor;

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

float dither4x4(const vec2 position, float brightness) {
  int x = int(mod(position.x, 4.0));
  int y = int(mod(position.y, 4.0));
  int index = x + y * 4;

	float limit = threshold[index];

	return step(brightness, limit);
}

void main() {
	vec4 col = texture(uTex, vUv);
	col *= 64.;
	col = floor(col + .5);
	col /= 64.;
	fragColor = col * dither4x4(gl_FragCoord.xy, luma(col.rgb));
}
