import * as THREE from "three";

import { range } from "@/util";

// Procedually generated stone wall texture
export default class StoneWallTexturePack {
	private _albedo: THREE.DataTexture;
	private _displacement: THREE.DataTexture;
	private _ao: THREE.DataTexture;
	private _normal: THREE.DataTexture;

	public get albedoMap() { return this._albedo; }
	public get displacementMap() { return this._displacement; }
	public get aoMap() { return this._ao; }
	public get normalMap() { return this._normal; }

	constructor(
		width: number, height: number,
		tilePos: THREE.Vector3,
	) {
		const gridInterval = 4;
		const textureSize = width * height;
		// 0 ~ 255
		const albedoData = new Uint8Array(3 * textureSize);
		// 0 ~ 255
		const displacementData = new Uint8Array(3 * textureSize);
		// 0 ~ 1
		const aoData = new Float32Array(textureSize);
		// 0 ~ 1
		const normalData = new Float32Array(4 * textureSize);

		for (const y of range(height)) {
			for (const x of range(width)) {
				const texIndex = y * width + x;
				if ((x + 1) % gridInterval === 0 || y % gridInterval === 0) {
					albedoData[3 * texIndex + 0] = 0;
					albedoData[3 * texIndex + 1] = 0;
					albedoData[3 * texIndex + 2] = 0;
				} else {
					albedoData[3 * texIndex + 0] = 10 * tilePos.x;
					albedoData[3 * texIndex + 1] = 10 * tilePos.y;
					albedoData[3 * texIndex + 2] = 10 * tilePos.z;
				}
			}
		}

		this._albedo = new THREE.DataTexture(albedoData, width, height, THREE.RGBFormat, THREE.UnsignedByteType);
		this._displacement = new THREE.DataTexture(displacementData, width, height, THREE.RGBFormat, THREE.UnsignedByteType);
		this._ao = new THREE.DataTexture(aoData, width, height, THREE.RedFormat, THREE.FloatType);
		this._normal = new THREE.DataTexture(normalData, width, height, THREE.RGBAFormat, THREE.FloatType);
	}
}
