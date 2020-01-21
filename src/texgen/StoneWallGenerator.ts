import * as THREE from "three";

import TileMap from "@/map/TileMap";
import StoneWallStrategy from "./strategy/StoneWallStrategy";
import { range, random, parseColorHex } from "@/util";
import { DIRECTION } from "@/const/common";
import * as TEXTURE from "@/const/texture";
import * as COLORS from "@/palette/colors";
import { TexturePack, Palette, Vec3 } from "@/type/common";
import { Brick } from "@/type/texture";

// Procedually generated stone wall texture
export default class StoneWallGenerator {
	private _map: TileMap;
	private _bricks: Map<number, Brick>;
	private _palette: Vec3[];
	private _strategy: StoneWallStrategy;

	constructor(map: TileMap, palette: Palette) {
		this._map = map;
		this._bricks = new Map();
		this._strategy = new StoneWallStrategy();
		this._palette = palette.colors.map(hex => parseColorHex(hex));
	}

	public prepare(x: number, y: number, z: number) {
		const strategy = this._strategy;
		const bricks = this._bricks;

		const brick = strategy.createBrick({
			map: this._map,
			pos: [x, y, z],
			palette: this._palette,
			neighbors: {
				[DIRECTION.NX]: bricks.get(this._tileIndexAt(x - 1, y, z)),
				[DIRECTION.NY]: bricks.get(this._tileIndexAt(x, y - 1, z)),
				[DIRECTION.NZ]: bricks.get(this._tileIndexAt(x, y, z - 1)),
			},
		});

		bricks.set(this._tileIndexAt(x, y, z), brick);
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
		const aoMap = new THREE.DataTexture(topData.aoData, width, height, THREE.RedFormat, THREE.FloatType);
		const normalMap = new THREE.DataTexture(topData.normalData, width, height, THREE.RGBAFormat, THREE.FloatType);

		albedoMap.flipY = true;
		displacementMap.flipY = true;
		aoMap.flipY = true;
		normalMap.flipY = true;

		return {
			albedoMap,
			displacementMap,
			aoMap,
			normalMap,
		};
	}

	private _generateSide(x: number, y: number, z: number, side: DIRECTION): TexturePack {
		const width = TEXTURE.SIZE.SIDE.WIDTH;
		const height = TEXTURE.SIZE.SIDE.HEIGHT;
		const sideData = this._generateSideData(x, y, z, side);

		const albedoMap = new THREE.DataTexture(sideData.albedoData, width, height, THREE.RGBFormat, THREE.UnsignedByteType);
		const displacementMap = new THREE.DataTexture(sideData.displacementData, width, height, THREE.RGBFormat, THREE.UnsignedByteType);
		const aoMap = new THREE.DataTexture(sideData.aoData, width, height, THREE.RedFormat, THREE.FloatType);
		const normalMap = new THREE.DataTexture(sideData.normalData, width, height, THREE.RGBAFormat, THREE.FloatType);

		albedoMap.flipY = true;
		displacementMap.flipY = true;
		aoMap.flipY = true;
		normalMap.flipY = true;

		return {
			albedoMap,
			displacementMap,
			aoMap,
			normalMap,
		};
	}

	private _generateTopData(x: number, y: number, z: number, side: DIRECTION): {
		albedoData: Uint8Array,
		displacementData: Uint8Array,
		aoData: Float32Array,
		normalData: Float32Array,
	} {
		const width = TEXTURE.SIZE.TOP.WIDTH;
		const height = TEXTURE.SIZE.TOP.HEIGHT;
		const gridInterval = TEXTURE.GRID_INTERVAL;
		const gridWidth = width / gridInterval;
		const gridHeight = height / gridInterval;
		const textureSize = width * height;

		const albedoData = new Uint8Array(3 * textureSize); // 0 ~ 255
		const displacementData = new Uint8Array(3 * textureSize); // 0 ~ 255
		const aoData = new Float32Array(textureSize); // 0 ~ 1
		const normalData = new Float32Array(4 * textureSize); // 0 ~ 1

		const topBricks = this._bricks.get(this._tileIndexAt(x, y, z))![TEXTURE.BRICK_FLOOR.TOP];

		for (const texX of range(width)) {
			for (const texY of range(height)) {
				const gridX = Math.floor(texX / gridInterval);
				const gridY = Math.floor(texY / gridInterval);
				const gridOffsetX = texX % gridInterval;
				const gridOffsetY = texY % gridInterval;
				const texelIndex = texX + texY * width;

				const voxel = topBricks[gridX][gridHeight - gridY - 1];

				if (gridOffsetX === 0 && !voxel.connection[DIRECTION.NX]) {
					albedoData[3 * texelIndex + 0] = 0;
					albedoData[3 * texelIndex + 1] = 0;
					albedoData[3 * texelIndex + 2] = 0;
				} else if (gridOffsetY === gridInterval - 1 && !voxel.connection[DIRECTION.NY]) {
					albedoData[3 * texelIndex + 0] = 0;
					albedoData[3 * texelIndex + 1] = 0;
					albedoData[3 * texelIndex + 2] = 0;
				} else {
					albedoData[3 * texelIndex + 0] = voxel.color[0];
					albedoData[3 * texelIndex + 1] = voxel.color[1];
					albedoData[3 * texelIndex + 2] = voxel.color[2];
				}
			}
		}

		return {
			albedoData,
			displacementData,
			aoData,
			normalData,
		};
	}

	private _generateSideData(x: number, y: number, z: number, side: DIRECTION): {
		albedoData: Uint8Array,
		displacementData: Uint8Array,
		aoData: Float32Array,
		normalData: Float32Array,
	} {
		const width = TEXTURE.SIZE.SIDE.WIDTH;
		const height = TEXTURE.SIZE.SIDE.HEIGHT;
		const gridInterval = TEXTURE.GRID_INTERVAL;
		const gridWidth = width / gridInterval;
		const gridHeight = height / gridInterval;
		const textureSize = width * height;

		const albedoData = new Uint8Array(3 * textureSize); // 0 ~ 255
		const displacementData = new Uint8Array(3 * textureSize); // 0 ~ 255
		const aoData = new Float32Array(textureSize); // 0 ~ 1
		const normalData = new Float32Array(4 * textureSize); // 0 ~ 1

		const brick = this._bricks.get(this._tileIndexAt(x, y, z))!;

		[TEXTURE.BRICK_FLOOR.TOP, TEXTURE.BRICK_FLOOR.BOTTOM].forEach((floor, floorIdx) => {
			const voxels = brick[floor];

			let connections: boolean[];
			let zConnections: boolean[];
			let colors: Vec3[];
			if (side === DIRECTION.PX) {
				connections = voxels[gridWidth - 1].map(voxel => voxel.connection[DIRECTION.PY]);
				zConnections = voxels[gridWidth - 1].map(voxel => voxel.connection[DIRECTION.NZ]);
				colors = voxels[gridWidth - 1].map(voxel => voxel.color);
			} else if (side === DIRECTION.NX) {
				connections = voxels[0].map(voxel => voxel.connection[DIRECTION.NY]).reverse();
				zConnections = voxels[0].map(voxel => voxel.connection[DIRECTION.NZ]).reverse();
				colors = voxels[0].map(voxel => voxel.color).reverse();
			} else if (side === DIRECTION.PY) {
				connections = voxels.map(voxelsX => voxelsX[gridHeight - 1].connection[DIRECTION.NX]).reverse();
				zConnections = voxels.map(voxelsX => voxelsX[gridHeight - 1].connection[DIRECTION.NZ]).reverse();
				colors = voxels.map(voxelsX => voxelsX[gridHeight - 1].color).reverse();
			} else {
				connections = voxels.map(voxelsX => voxelsX[0].connection[DIRECTION.PX]);
				zConnections = voxels.map(voxelsX => voxelsX[0].connection[DIRECTION.NZ]);
				colors = voxels.map(voxelsX => voxelsX[0].color);
			}

			for (const texX of range(width)) {
				for (const texY of range(gridInterval)) {
					const gridX = Math.floor(texX / gridInterval);
					const gridOffsetX = texX % gridInterval;
					const texelIndex = texX + texY * width + floorIdx * width * gridInterval;

					if (gridOffsetX === gridInterval - 1 && !connections[gridX]) {
						albedoData[3 * texelIndex + 0] = 0;
						albedoData[3 * texelIndex + 1] = 0;
						albedoData[3 * texelIndex + 2] = 0;
					} else if (texY === gridInterval - 1 && !zConnections[gridX]) {
						albedoData[3 * texelIndex + 0] = 0;
						albedoData[3 * texelIndex + 1] = 0;
						albedoData[3 * texelIndex + 2] = 0;
					} else {
						albedoData[3 * texelIndex + 0] = colors[gridX][0];
						albedoData[3 * texelIndex + 1] = colors[gridX][1];
						albedoData[3 * texelIndex + 2] = colors[gridX][2];
					}
				}
			}
		});

		return {
			albedoData,
			displacementData,
			aoData,
			normalData,
		};
	}

	private _tileIndexAt(x: number, y: number, z: number) {
		const mapSize = this._map.size;
		if (x >= mapSize[0] || x < 0 || y >= mapSize[1] || y < 0) return -1;
		return x + y * mapSize[0] + z * mapSize[0] * mapSize[1];
	}
}
