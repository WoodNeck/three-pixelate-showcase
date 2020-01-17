import * as THREE from "three";

import Map from "@/map/Map";
import { range, random } from "@/util";
import { TILE_SIDE } from "@/const";

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
		side: TILE_SIDE,
		tilePos: THREE.Vector3,
		map: Map,
	) {
		const width = 16;
		const height = 8;
		const gridInterval = 4;
		const textureSize = width * height;
		const mapSize = map.mapSize;
		const patterns = [
			[false, true, false],
			[true, true, false],
			[false, true, true],
			[true, false, true],
			[true, true, true],
		];

		// 0 ~ 255
		const albedoData = new Uint8Array(3 * textureSize);
		// 0 ~ 255
		const displacementData = new Uint8Array(3 * textureSize);
		// 0 ~ 1
		const aoData = new Float32Array(textureSize);
		// 0 ~ 1
		const normalData = new Float32Array(4 * textureSize);

		const nextTilePos = tilePos.clone();
		nextTilePos.setX(nextTilePos.x + 1);

		const tileIndex = this._tileIndexAt(tilePos, mapSize);
		const nextTileIndex = this._tileIndexAt(nextTilePos, mapSize);

		const randomValTop = Math.floor(random(this._randomSeedAt(side, tileIndex, 0)) * patterns.length);
		const randomValBottom = Math.floor(random(this._randomSeedAt(side, tileIndex, 1)) * patterns.length);
		const randomValNextTop = Math.floor(random(this._randomSeedAt(side, nextTileIndex, 0)) * patterns.length);
		const randomValNextBottom = Math.floor(random(this._randomSeedAt(side, nextTileIndex, 1)) * patterns.length);

		const chosenPatterns = [
			patterns[randomValTop],
			patterns[randomValBottom],
		];
		const chosenPatternsNextTile = [
			patterns[randomValNextTop],
			patterns[randomValNextBottom],
		];

		for (const y of range(height)) {
			for (const x of range(width)) {
				const texIndex = y * width + x;
				const gridX = Math.floor(x / gridInterval);
				const gridY = Math.floor(y / gridInterval);
				const gridOffsetX = (x + 1) % gridInterval;
				const gridOffsetY = (y + 1) % gridInterval;

				const isClosedX = gridX !== 3
					? chosenPatterns[gridY][gridX]
					: !chosenPatterns[gridY][2] || !chosenPatternsNextTile[gridY][0];
				const isClosedY = gridY === 0
					? true // chosenPatterns[0][gridX - 1] !== chosenPatterns[1][gridX - 1] || chosenPatterns[0][gridX] !== chosenPatterns[1][gridX]
					: true;
				const isGrid = (gridOffsetX === 0 && isClosedX)
					|| (gridOffsetY === 0 && isClosedY);

				if (isGrid) {
					albedoData[3 * texIndex + 0] = 0;
					albedoData[3 * texIndex + 1] = 0;
					albedoData[3 * texIndex + 2] = 0;
				} else {
					albedoData[3 * texIndex + 0] = 255;
					albedoData[3 * texIndex + 1] = 255;
					albedoData[3 * texIndex + 2] = 255;
				}
			}
		}

		this._albedo = new THREE.DataTexture(albedoData, width, height, THREE.RGBFormat, THREE.UnsignedByteType);
		this._displacement = new THREE.DataTexture(displacementData, width, height, THREE.RGBFormat, THREE.UnsignedByteType);
		this._ao = new THREE.DataTexture(aoData, width, height, THREE.RedFormat, THREE.FloatType);
		this._normal = new THREE.DataTexture(normalData, width, height, THREE.RGBAFormat, THREE.FloatType);

		this._albedo.flipY = true;
	}

	private _tileIndexAt(pos: THREE.Vector3, mapSize: number[]) {
		return pos.x + pos.y * mapSize[0] + pos.z * mapSize[0] * mapSize[1];
	}

	private _randomSeedAt(side: number, tileIndex: number, offset: number) {
		return 4 * tileIndex + 2 * offset + side;
	}
}
