#version 300 es
precision highp float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;

uniform sampler2D displacementMap;

in vec3 position;
in vec3 normal;
in vec2 uv;

out vec2 vUv;
out vec3 vNormal;
out vec3 vCameraTo;

void main() {
	vUv = uv;

	vec3 displacement = texture(displacementMap, uv).rgb;
	vec3 camPos = cameraPosition;
	vec4 worldPos = modelMatrix * vec4(position, 1);

	vNormal = normalMatrix * normal;
	vec4 cameraTo = projectionMatrix * vec4(normalize(camPos - worldPos.xyz), 1.);
	vCameraTo = cameraTo.xyz / cameraTo.w;
	// vCameraTo = worldPos.xyz;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
