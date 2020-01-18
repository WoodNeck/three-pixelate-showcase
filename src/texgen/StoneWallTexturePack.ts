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
	private _map: Map;

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

		this._map = map;

		const textureSize = width * height;

		// Possible horizontal tile patterns
		// This patterns ensures that there're no block that has width more than 8
		const patterns = [
			[false, true, false],
			[true, true, false],
			[false, true, true],
			[true, false, true],
			[true, true, true],
		];

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
			case TILE_SIDE.PX:
				cwSide = TILE_SIDE.NY;
				ccwSide = TILE_SIDE.PY;
				prevTilePos.setY(prevTilePos.y - 1);
				nextTilePos.setY(nextTilePos.y + 1);
				break;
			case TILE_SIDE.NX:
				cwSide = TILE_SIDE.PY;
				ccwSide = TILE_SIDE.NY;
				prevTilePos.setY(prevTilePos.y + 1);
				nextTilePos.setY(nextTilePos.y - 1);
				break;
			case TILE_SIDE.PY:
				cwSide = TILE_SIDE.PX;
				ccwSide = TILE_SIDE.NX;
				prevTilePos.setX(prevTilePos.x + 1);
				nextTilePos.setX(nextTilePos.x - 1);
				break;
			case TILE_SIDE.NY:
				cwSide = TILE_SIDE.NX;
				ccwSide = TILE_SIDE.PX;
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

		// Height of current tile, starting from 1
		const tileHeight = tilePos.z + 1;
		const prevGridHeight = map.getHeightAt(prevTilePos.x, prevTilePos.y);
		const nextGridHeight = map.getHeightAt(nextTilePos.x, nextTilePos.y);
		const hasPrevTile = tileHeight <= prevGridHeight;
		const hasNextTile = tileHeight <= nextGridHeight;

		// Height of map grid that can block this stone block's last horizontal grid
		let blockingGridHeight: number = 0;
		switch (side) {
			case TILE_SIDE.PX:
				blockingGridHeight = map.getHeightAt(tilePos.x + 1, tilePos.y + 1);
				break;
			case TILE_SIDE.NX:
				blockingGridHeight = map.getHeightAt(tilePos.x - 1, tilePos.y - 1);
				break;
			case TILE_SIDE.PY:
				blockingGridHeight = map.getHeightAt(tilePos.x - 1, tilePos.y + 1);
				break;
			case TILE_SIDE.NY:
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
					const isSameTopBottom = chosenPatterns[0][gridX - 1] === chosenPatterns[1][gridX - 1] && chosenPatterns[0][gridX] === chosenPatterns[1][gridX]

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
						isOpenY = gridX < 2
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
					if (side === TILE_SIDE.PY || side === TILE_SIDE.NY) {
						albedoData[3 * texIndex + 0] = 255;
						albedoData[3 * texIndex + 1] = 255;
						albedoData[3 * texIndex + 2] = 255;
					} else {
						albedoData[3 * texIndex + 0] = 128;
						albedoData[3 * texIndex + 1] = 128;
						albedoData[3 * texIndex + 2] = 128;
					}
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

	private _randomSeedAt(side: TILE_SIDE, tileIndex: number, offset: 0|1) {
		return 8 * tileIndex + 4 * offset + side;
	}

	private _randomValAt(side: TILE_SIDE, pos: THREE.Vector3, offset: 0|1, max: number) {
		const tileIndex = this._tileIndexAt(pos, this._map.mapSize);
		return Math.floor(random(this._randomSeedAt(side, tileIndex, offset)) * max);
	}
}
