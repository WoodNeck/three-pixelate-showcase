import * as THREE from "three";

export type Vec3 = [number, number, number];

export interface Palette {
	name: string;
	outline: string;
	colors: string[];
}

export interface Updateable {
	update(ms: number): void;
}

export interface TexturePack {
	albedoMap: THREE.DataTexture;
	displacementMap: THREE.DataTexture;
	normalMap: THREE.DataTexture;
}
