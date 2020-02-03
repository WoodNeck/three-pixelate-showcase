import * as THREE from "three";

import TileMap from "@/map/TileMap";
import { range, parseColorHex } from "@/util";
import { DIRECTION } from "@/const/common";
import * as TEXTURE from "@/const/texture";
import { TexturePack, Palette } from "@/type/common";
import TextureGenerator from "./TextureGenerator";

export default class PlankGenerator implements TextureGenerator {
	private _map: TileMap;

	constructor(map: TileMap, palette: Palette) {
		this._map = map;
	}

	public prepare(x: number, y: number, z: number, hasSameTypeOnTop: boolean) {

	}

	public generate(x: number, y: number, z: number, side: DIRECTION): TexturePack {
		return (side === DIRECTION.PZ || side === DIRECTION.NZ)
			? this._generateTop(x, y, z, side)
			: this._generateSide(x, y, z, side);
	}

	private _generateTop(x: number, y: number, z: number, side: DIRECTION): TexturePack {
		const width = TEXTURE.SIZE.TOP.WIDTH;
		const height = TEXTURE.SIZE.TOP.HEIGHT;
		const topData = this._generateTopData(x, y, z, side);

		const albedoMap = new THREE.DataTexture(topData.albedoData, width, height, THREE.RGBFormat, THREE.UnsignedByteType);
		const displacementMap = new THREE.DataTexture(topData.displacementData, width, height, THREE.RGBFormat, THREE.UnsignedByteType);
		const normalMap = new THREE.DataTexture(topData.normalData, width, height, THREE.RGBAFormat, THREE.FloatType);

		albedoMap.flipY = true;
		displacementMap.flipY = true;
		normalMap.flipY = true;

		return {
			albedoMap,
			displacementMap,
			normalMap,
		};
	}

	private _generateSide(x: number, y: number, z: number, side: DIRECTION): TexturePack {
		const width = TEXTURE.SIZE.SIDE.WIDTH;
		const height = TEXTURE.SIZE.SIDE.HEIGHT;
		const sideData = this._generateSideData(x, y, z, side);

		const albedoMap = new THREE.DataTexture(sideData.albedoData, width, height, THREE.RGBFormat, THREE.UnsignedByteType);
		const displacementMap = new THREE.DataTexture(sideData.displacementData, width, height, THREE.RGBFormat, THREE.UnsignedByteType);
		const normalMap = new THREE.DataTexture(sideData.normalData, width, height, THREE.RGBAFormat, THREE.FloatType);

		albedoMap.flipY = true;
		displacementMap.flipY = true;
		normalMap.flipY = true;

		return {
			albedoMap,
			displacementMap,
			normalMap,
		};
	}

	private _generateTopData(x: number, y: number, z: number, side: DIRECTION): {
		albedoData: Uint8Array,
		displacementData: Uint8Array,
		normalData: Float32Array,
	} {
		const width = TEXTURE.SIZE.TOP.WIDTH;
		const height = TEXTURE.SIZE.TOP.HEIGHT;
		const textureSize = width * height;

		const albedoData = new Uint8Array(3 * textureSize); // 0 ~ 255
		const displacementData = new Uint8Array(3 * textureSize); // 0 ~ 255
		const normalData = new Float32Array(4 * textureSize); // 0 ~ 1

		const color = parseColorHex("#644924");

		for (const texX of range(width)) {
			for (const texY of range(height)) {
				const texelIndex = texX + texY * width;

				albedoData[3 * texelIndex + 0] = color[0];
				albedoData[3 * texelIndex + 1] = color[1];
				albedoData[3 * texelIndex + 2] = color[2];
			}
		}

		return {
			albedoData,
			displacementData,
			normalData,
		};
	}

	private _generateSideData(x: number, y: number, z: number, side: DIRECTION): {
		albedoData: Uint8Array,
		displacementData: Uint8Array,
		normalData: Float32Array,
	} {
		const width = TEXTURE.SIZE.SIDE.WIDTH;
		const height = TEXTURE.SIZE.SIDE.HEIGHT;
		const gridInterval = TEXTURE.GRID_INTERVAL;
		const textureSize = width * height;

		const albedoData = new Uint8Array(3 * textureSize); // 0 ~ 255
		const displacementData = new Uint8Array(3 * textureSize); // 0 ~ 255
		const normalData = new Float32Array(4 * textureSize); // 0 ~ 1

		const color = parseColorHex("#644924");

		[TEXTURE.BRICK_FLOOR.TOP, TEXTURE.BRICK_FLOOR.BOTTOM].forEach((floor, floorIdx) => {
			for (const texX of range(width)) {
				for (const texY of range(gridInterval)) {
					const texelIndex = texX + texY * width + floorIdx * width * gridInterval;

					albedoData[3 * texelIndex + 0] = color[0];
					albedoData[3 * texelIndex + 1] = color[1];
					albedoData[3 * texelIndex + 2] = color[2];
				}
			}
		});

		return {
			albedoData,
			displacementData,
			normalData,
		};
	}
}
