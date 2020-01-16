import * as THREE from "three";
import { parse } from "papaparse";

import Tile from "@/entity/Tile";
import mapData from "./qadriga.csv";
import { range } from "@/util";

export default class Map {
	private _tiles: Tile[][];
	private _mapSize: number[];

	public get tiles() { return this._tiles; }

	constructor() {
		// Load map
		const map = parse(mapData, {
			skipEmptyLines: true,
			dynamicTyping: true,
		});
		const meta = map.data.splice(0, 1);
		const tileData = map.data;
		const mapSize = meta[0];
		const tiles: Tile[][] = [];

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
						),
					);
				}

				tiles.push(tilesAtXY);
			}
		}

		this._tiles = tiles;
		this._mapSize = mapSize;
	}

	public getTilesAt(x: number, y: number): Tile[] {
		return this._tiles[y * this._mapSize[0] + x];
	}
}
