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

	public generate(side: DIRECTION): TexturePack {

	}

	public generateTop(): TexturePack {
		const width = TOP_WIDTH;
		const height = TOP_HEIGHT;
		const topData = this._generateTopData(width, height);

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

	public generateSide(side: DIRECTION): TexturePack {
		const width = TEXTURE.SIDE.WIDTH;
		const height = TEXTURE.SIDE.HEIGHT;
		const sideData = this._generateSideData(side, width, height);

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

	private _generateTopData(width: number, height: number): {
		albedoData: Uint8Array,
		displacementData: Uint8Array,
		aoData: Float32Array,
		normalData: Float32Array,
	} {
		const map = this._map;
		const tilePos = this._tilePos;
		const gridInterval = GRID_INTERVAL;
		const textureSize = width * height;

		const sideDatas = [DIRECTION.PX, DIRECTION.NX, DIRECTION.PY, DIRECTION.NY].map(side => {
			return this._generateSideData(side, SIDE_WIDTH, SIDE_HEIGHT);
		});

		const albedoData = new Uint8Array(3 * textureSize); // 0 ~ 255
		const displacementData = new Uint8Array(3 * textureSize); // 0 ~ 255
		const aoData = new Float32Array(textureSize); // 0 ~ 1
		const normalData = new Float32Array(4 * textureSize); // 0 ~ 1

		const tileHeight = tilePos.z + 1;
		const nxTileHeight = map.getHeightAt(tilePos.x - 1, tilePos.y);
		const nyTileHeight = map.getHeightAt(tilePos.x, tilePos.y - 1);
		const hasNXTile = tileHeight <= nxTileHeight;
		const hasNYTile = tileHeight <= nyTileHeight;

		const isBlack = (data: Uint8Array, idx: number) => {
			return data[3 * idx] === 0
				&& data[3 * idx + 1] === 0
				&& data[3 * idx + 2] === 0;
		};

		for (const y of range(height)) {
			for (const x of range(width)) {
				const texIndex = y * width + x;
				const xSide = x < width / 2
					? DIRECTION.NX
					: DIRECTION.PX;
				const ySide = y < height / 2
					? DIRECTION.PY
					: DIRECTION.NY;
				const texX = x < width / 2
					? y
					: height - (y + 2);
				const texY = y < height / 2
					? width - (x + 1)
					: x - 1;
				const gridX = Math.floor(x / gridInterval);
				const gridY = Math.floor(y / gridInterval);
				const gridOffsetX = (texX + 1) % gridInterval;
				const gridOffsetY = (texY + 1) % gridInterval;
				const albedoX = sideDatas[xSide].albedoData.slice(3 * texX, 3 * texX + 3);
				const albedoY = sideDatas[ySide].albedoData.slice(3 * texY, 3 * texY + 3);

				if (gridOffsetX === 0) {
					albedoData[3 * texIndex + 0] = albedoX[0];
					albedoData[3 * texIndex + 1] = albedoX[1];
					albedoData[3 * texIndex + 2] = albedoX[2];
				} else if (gridOffsetY === 0) {
					albedoData[3 * texIndex + 0] = albedoY[0];
					albedoData[3 * texIndex + 1] = albedoY[1];
					albedoData[3 * texIndex + 2] = albedoY[2];
				} else {
					if ((gridX < 2 && gridY < 2) || (gridX >= 2 && gridY >= 2)) {
						albedoData[3 * texIndex + 0] = albedoY[0];
						albedoData[3 * texIndex + 1] = albedoY[1];
						albedoData[3 * texIndex + 2] = albedoY[2];
					} else {
						albedoData[3 * texIndex + 0] = albedoX[0];
						albedoData[3 * texIndex + 1] = albedoX[1];
						albedoData[3 * texIndex + 2] = albedoX[2];
					}
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

	private _generateSideData(side: DIRECTION, width: number, height: number): {
		albedoData: Uint8Array,
		displacementData: Uint8Array,
		aoData: Float32Array,
		normalData: Float32Array,
	} {
		const map = this._map;
		const tilePos = this._tilePos;
		const gridInterval = GRID_INTERVAL;
		const textureSize = width * height;



		const albedoData = new Uint8Array(3 * textureSize); // 0 ~ 255
		const displacementData = new Uint8Array(3 * textureSize); // 0 ~ 255
		const aoData = new Float32Array(textureSize); // 0 ~ 1
		const normalData = new Float32Array(4 * textureSize); // 0 ~ 1

		// ClockWise/Counter-Clockwise side from current side
		let cwSide = side;
		let ccwSide = side;
		// Prev/Next tile position, which is left(-X)/right(+X) tile when seen in front of that tile side
		const prevTilePos = tilePos.clone();
		const nextTilePos = tilePos.clone();
		switch (side) {
			case DIRECTION.PX:
				cwSide = DIRECTION.NY;
				ccwSide = DIRECTION.PY;
				prevTilePos.setY(prevTilePos.y - 1);
				nextTilePos.setY(nextTilePos.y + 1);
				break;
			case DIRECTION.NX:
				cwSide = DIRECTION.PY;
				ccwSide = DIRECTION.NY;
				prevTilePos.setY(prevTilePos.y + 1);
				nextTilePos.setY(nextTilePos.y - 1);
				break;
			case DIRECTION.PY:
				cwSide = DIRECTION.PX;
				ccwSide = DIRECTION.NX;
				prevTilePos.setX(prevTilePos.x + 1);
				nextTilePos.setX(nextTilePos.x - 1);
				break;
			case DIRECTION.NY:
				cwSide = DIRECTION.NX;
				ccwSide = DIRECTION.PX;
				prevTilePos.setX(prevTilePos.x - 1);
				nextTilePos.setX(nextTilePos.x + 1);
				break;
		}

		const patternsLength = patterns.length;
		// Predictable random values based on tile index & side
		const randomValTop = this._randomValAt(side, tilePos, 0, patternsLength);
		const randomValBottom = this._randomValAt(side, tilePos, 1, patternsLength);
		const randomValPrevTop = this._randomValAt(side, prevTilePos, 0, patternsLength);
		const randomValPrevBottom = this._randomValAt(side, prevTilePos, 1, patternsLength);
		const randomValNextTop = this._randomValAt(side, nextTilePos, 0, patternsLength);
		const randomValNextBottom = this._randomValAt(side, nextTilePos, 1, patternsLength);
		const randomValCWTileTop = this._randomValAt(cwSide, tilePos, 0, patternsLength);
		const randomValCWTileBottom = this._randomValAt(cwSide, tilePos, 1, patternsLength);
		const randomValCCWTileTop = this._randomValAt(ccwSide, tilePos, 0, patternsLength);
		const randomValCCWTileBottom = this._randomValAt(ccwSide, tilePos, 1, patternsLength);

		const chosenPatterns = [
			patterns[randomValTop],
			patterns[randomValBottom],
		];
		const chosenPatternsPrevTile = [
			patterns[randomValPrevTop],
			patterns[randomValPrevBottom],
		];
		const chosenPatternsNextTile = [
			patterns[randomValNextTop],
			patterns[randomValNextBottom],
		];
		const chosenPatternsCWTile = [
			patterns[randomValCWTileTop],
			patterns[randomValCWTileBottom],
		];
		const chosenPatternsCCWTile = [
			patterns[randomValCCWTileTop],
			patterns[randomValCCWTileBottom],
		];

		// Colors for each grid
		const palette = COLORS.ICE_CREAM_GB;
		const paletteLength = palette.colors.length;
		const chosenColors = [...range(8)].map(idx => {
			return parseColorHex(palette.colors[this._randomValAt(side, tilePos, idx, paletteLength)]);
		});
		const chosenNextColors = [...range(8)].map(idx => {
			return parseColorHex(palette.colors[this._randomValAt(side, nextTilePos, idx, paletteLength)]);
		});
		const chosenCCWColors = [...range(8)].map(idx => {
			return parseColorHex(palette.colors[this._randomValAt(ccwSide, tilePos, idx, paletteLength)]);
		});

		// Height of current tile, starting from 1
		const tileHeight = tilePos.z + 1;
		const prevGridHeight = map.getHeightAt(prevTilePos.x, prevTilePos.y);
		const nextGridHeight = map.getHeightAt(nextTilePos.x, nextTilePos.y);
		const hasPrevTile = tileHeight <= prevGridHeight;
		const hasNextTile = tileHeight <= nextGridHeight;

		// Height of map grid that can block this stone block's last horizontal grid
		let blockingGridHeight: number = 0;
		switch (side) {
			case DIRECTION.PX:
				blockingGridHeight = map.getHeightAt(tilePos.x + 1, tilePos.y + 1);
				break;
			case DIRECTION.NX:
				blockingGridHeight = map.getHeightAt(tilePos.x - 1, tilePos.y - 1);
				break;
			case DIRECTION.PY:
				blockingGridHeight = map.getHeightAt(tilePos.x - 1, tilePos.y + 1);
				break;
			case DIRECTION.NY:
				blockingGridHeight = map.getHeightAt(tilePos.x + 1, tilePos.y - 1);
				break;
		}

		for (const y of range(height)) {
			for (const x of range(width)) {
				// Grid pattern, closed means texel is belong to black line.
				const texIndex = y * width + x;
				const gridX = Math.floor(x / gridInterval);
				const gridY = Math.floor(y / gridInterval);
				const gridOffsetX = (x + 1) % gridInterval;
				const gridOffsetY = (y + 1) % gridInterval;

				const connectedWithNextTile = hasNextTile && (!chosenPatterns[gridY][2] || !chosenPatternsNextTile[gridY][0]);

				const isClosedX = gridX < 3
					? chosenPatterns[gridY][gridX]
					: tileHeight <= blockingGridHeight // Is connected its edge to blocking grid
						|| connectedWithNextTile;
				const isGridX = gridOffsetX === 0 && isClosedX;

				let isOpenY = false;

				if (gridY === 0) {
					const isSameTopBottom = chosenPatterns[0][gridX - 1] === chosenPatterns[1][gridX - 1] && chosenPatterns[0][gridX] === chosenPatterns[1][gridX];

					if (gridX < 1) {
						if (hasPrevTile) {
							const connectedTopWithPrevTile = chosenPatterns[0][0] && chosenPatternsPrevTile[0][2];
							const connectedBottomWithPrevTile = chosenPatterns[1][0] && chosenPatternsPrevTile[1][2];

							isOpenY = (connectedTopWithPrevTile && connectedBottomWithPrevTile)
								|| ((!connectedTopWithPrevTile && !connectedBottomWithPrevTile) && isSameTopBottom);
						} else {
							const connectedTopWithCWTile = chosenPatterns[0][0] && chosenPatternsCWTile[0][2];
							const connectedBottomWithCWTile = chosenPatterns[1][0] && chosenPatternsCWTile[1][2];

							isOpenY = connectedTopWithCWTile && connectedBottomWithCWTile;
						}
					} else if (gridX > 2) {
						if (hasNextTile) {
							const connectedTopWithNextTile = hasNextTile && chosenPatterns[0][2] && chosenPatternsNextTile[0][0];
							const connectedBottomWithNextTile = hasNextTile && chosenPatterns[1][2] && chosenPatternsNextTile[1][0];

							isOpenY = (connectedTopWithNextTile && connectedBottomWithNextTile)
								|| ((!connectedTopWithNextTile && !connectedBottomWithNextTile) && isSameTopBottom);
						} else {
							const connectedTopWithCCWTile = chosenPatterns[0][2] && chosenPatternsCCWTile[0][0];
							const connectedBottomWithCCWTile = chosenPatterns[1][2] && chosenPatternsCCWTile[1][0];

							isOpenY = connectedTopWithCCWTile && connectedBottomWithCCWTile;
						}
					} else {
						const isSquared = !chosenPatterns[0][1] && !chosenPatterns[1][1];

						isOpenY = isSquared
							|| gridX < 2
								? isSameTopBottom && hasPrevTile
								: isSameTopBottom && hasNextTile;
					}
				}

				const isGridY = gridOffsetY === 0 && !isOpenY;
				const isGrid = isGridX || isGridY;

				if (isGrid) {
					albedoData[3 * texIndex + 0] = 0;
					albedoData[3 * texIndex + 1] = 0;
					albedoData[3 * texIndex + 2] = 0;
				} else {
					let chosenColor = chosenColors[gridY * 4 + gridX];

					if (tilePos.x === 0 && tilePos.y === 0 && tilePos.z === 0 && side === DIRECTION.NX && gridX === 2 && gridY === 0) {
						const nextColors = hasNextTile
							? chosenNextColors
							: chosenCCWColors;
						const offset = hasNextTile || chosenPatternsCCWTile[gridY][0]
							? 0
							: 1;
						chosenColor = gridX > 2
							? nextColors[gridY * 4 + offset]
							: chosenColors[gridY * 4 + gridX + 1];
					}
					if (!isClosedX) {
						const nextColors = hasNextTile
							? chosenNextColors
							: chosenCCWColors;
						const offset = hasNextTile || chosenPatternsCCWTile[gridY][0]
							? 0
							: 1;
						chosenColor = (gridX > 2) || (gridX > 1 && !hasNextTile)
							? nextColors[gridY * 4 + offset]
							: chosenColors[gridY * 4 + gridX + 1];
					}
					if (isOpenY) {
						if (!isClosedX) {
							const nextColors = hasNextTile
								? chosenNextColors
								: chosenCCWColors;
							const offset = hasNextTile || chosenPatternsCCWTile[gridY][0]
								? 0
								: 1;
							chosenColor = (gridX > 2) || (gridX > 1 && !hasNextTile)
								? nextColors[4 + offset]
								: chosenColors[4 + gridX + 1];
						} else {
							chosenColor = chosenColors[4 + gridX];
						}
					}

					albedoData[3 * texIndex + 0] = chosenColor[0];
					albedoData[3 * texIndex + 1] = chosenColor[1];
					albedoData[3 * texIndex + 2] = chosenColor[2];
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

	private _getPattern(x: number, y: number, z: number, side: DIRECTION) {
		const selectedPatterns = this._selectedPatterns;
		const tileIndex = this._tileIndexAt(x, y, z, side);

		if (selectedPatterns.has(tileIndex)) {
			return selectedPatterns.get(tileIndex);
		} else {
			const patterns = TEXTURE.STONE_WALL.PATTERNS;
			const topSeed = this._randomSeedAt(tileIndex, TEXTURE.STONE_WALL.SIDE.TOP);
			const btmSeed = this._randomSeedAt(tileIndex, TEXTURE.STONE_WALL.SIDE.BOTTOM);
			const topPattern = patterns[this._randomInt(topSeed, patterns.length)];
			const btmPattern = patterns[this._randomInt(btmSeed, patterns.length)];

			selectedPatterns.set(tileIndex, {
				[TEXTURE.STONE_WALL.SIDE.TOP]: topPattern,
				[TEXTURE.STONE_WALL.SIDE.BOTTOM]: btmPattern,
			});
		}
	}

	private _tileIndexAt(x: number, y: number, z: number) {
		const mapSize = this._map.size;
		return x + y * mapSize[0] + z * mapSize[0] * mapSize[1];
	}

	private _randomInt(seed: number, max: number) {
		return Math.floor(random(seed) * max);
	}

	private _randomSeedAt(tileIndex: number, offset: number) {
		if (offset >= 8) throw new Error("Offset can't be same or bigger than 8");
		return 8 * tileIndex + offset;
	}
}
