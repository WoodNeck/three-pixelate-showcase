#version 300 es
precision highp float;

in vec2 vUv;
out vec4 col;

void main() {
	col = vec4(vUv, 0, 1);
}
