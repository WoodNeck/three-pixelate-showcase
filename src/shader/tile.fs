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
uniform sampler2D normalMap;
uniform vec3 ambientLightColor;
uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

in vec2 vUv;
in vec3 vNormal;
out vec4 col;

void main() {
	vec3 lightTo = normalize(directionalLights[0].direction);
	vec4 albedo = texture(albedoMap, vUv);
	float diffuse = .7 * max(dot(vNormal, lightTo), 0.);
	vec3 ambient = .3 * ambientLightColor;

	col = vec4(ambient + diffuse, 1) * albedo;
}
