#version 300 es
precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

in vec3 position;
in vec2 uv;
out vec2 vUv;

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
