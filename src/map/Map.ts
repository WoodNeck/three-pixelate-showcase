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
		const mapSize = meta[0];
		const tiles = [];

		for (const y of range(mapSize[1])) {
			for (const x of range(mapSize[0])) {
				const index = mapSize[0] * y + x;
				const tileInfo = map.data[index];
				const height = tileInfo[0];

				for (const h of range(height)) {
					tiles.push(new Tile(x, y, h));
				}
			}
		}

		this._tiles = tiles;
	}
}
