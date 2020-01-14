import { parse } from "papaparse";
import mapData from "./qadriga.csv";
import { range } from "@/util";
import Tile from "@/entity/Tile";

export default class Map {
	private _tiles: Tile[];

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
		const tiles = [];

		const mapX = mapSize[0];
		const mapY = mapSize[1];

		for (const y of range(mapY)) {
			for (const x of range(mapX)) {
				const index = mapSize[0] * y + x;
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

				if (x === 0 && y === 0) {
					console.log(pxHeight, nxHeight, pyHeight, nyHeight);
				}

				for (const h of range(height)) {
					tiles.push(
						new Tile(x, y, h, [
							h + 1 > pxHeight,
							h + 1 > nxHeight,
							h + 1 > pyHeight,
							h + 1 > nyHeight,
							h + 1 === height,
							false, // h === 0,
						]),
					);
				}
			}
		}

		this._tiles = tiles;
	}
}
