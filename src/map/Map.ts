import * as THREE from "three";
import { parse } from "papaparse";

import Tile from "@/entity/Tile";
import mapData from "./qadriga.csv";
import { range } from "@/util";

export default class Map {
	private _tiles: Tile[][];
	private _mapSize: number[];
	private _tileData: number[][];

	public get tiles() { return this._tiles; }
	public get mapSize() { return this._mapSize; }

	constructor() {
		// Load map
		const map = parse(mapData, {
			skipEmptyLines: true,
			dynamicTyping: true,
		});
		const meta = map.data.splice(0, 1);
		const tileData = map.data as number[][]; // tileData[0] is height
		const tiles: Tile[][] = [];
		const mapSize = meta[0];

		this._tiles = tiles;
		this._tileData = map.data;
		this._mapSize = mapSize;

		const mapX = mapSize[0];
		const mapY = mapSize[1];

		for (const y of range(mapY)) {
			for (const x of range(mapX)) {
				const index = mapX * y + x;
				const tileInfo = tileData[index];
				const height = tileInfo[0];

				const pxIdx = index + 1;
				const nxIdx = index - 1;
				const pyIdx = index + mapX;
				const nyIdx = index - mapX;

				const pxHeight = x < (mapX - 1) ? ((tileData[pxIdx] && tileData[pxIdx][0]) || 0) : 0;
				const nxHeight = x > 0 ? ((tileData[nxIdx] && tileData[nxIdx][0]) || 0) : 0;
				const pyHeight = (tileData[pyIdx] && tileData[pyIdx][0]) || 0;
				const nyHeight = (tileData[nyIdx] && tileData[nyIdx][0]) || 0;

				const tilesAtXY: Tile[] = [];
				for (const h of range(height)) {
					const planeVisibility = [
						h + 1 > pxHeight,
						h + 1 > nxHeight,
						h + 1 > pyHeight,
						h + 1 > nyHeight,
						h + 1 === height,
						h === 0,
					];

					tilesAtXY.push(
						new Tile(
							new THREE.Vector3(x, y, h),
							planeVisibility,
							this,
						),
					);
				}

				tiles.push(tilesAtXY);
			}
		}
	}

	public getHeightAt(x: number, y: number): number {
		const mapSize = this._mapSize;
		const tileData = this._tileData;

		if (x >= mapSize[0] || x < 0) return 0;
		if (y >= mapSize[1] || y < 0) return 0;

		const index = y * mapSize[0] + x;
		return tileData[index]
			? tileData[index][0]
			: 0;
	}
}
