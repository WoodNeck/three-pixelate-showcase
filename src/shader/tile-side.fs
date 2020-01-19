#version 300 es
precision highp float;

struct DirectionalLight {
	vec3 direction;
	vec3 color;
	int shadow;
	float shadowBias;
	float shadowRadius;
	vec2 shadowMapSize;
};

uniform sampler2D albedoMap;
uniform sampler2D displacementMap;
uniform sampler2D aoMap;
uniform sampler2D normalMap;
uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

in vec2 vUv;
in vec3 vNormal;
out vec4 col;

void main() {
	vec3 lightTo = normalize(directionalLights[0].direction);
	float diffuse = dot(vNormal, lightTo) * .5 + .5;

	col = diffuse * texture(albedoMap, vUv);
}
