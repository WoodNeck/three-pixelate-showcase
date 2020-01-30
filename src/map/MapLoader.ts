import * as THREE from "three";
import { parse } from "papaparse";

import Tile from "@/entity/Tile";
import TileMap from "./TileMap";
import TextureGenerator from "@/texgen/TextureGenerator";
import StoneWallTexturePack from "@/texgen/StoneWallGenerator";
import * as COLORS from "@/palette/colors";
import { range } from "@/util";
import { TILE_TYPES } from "@/const/common";
import { TexturePack } from "@/type/common";

export default class MapLoader {
	public async load(mapName: string): Promise<TileMap> {
		const mapCSV = await import(/* webpackMode: "eager" */ `./${mapName}.csv`).then(val => val.default) as string;

		// Load map
		const mapInfo = parse(mapCSV, {
			skipEmptyLines: true,
			dynamicTyping: true,
		});
		const meta = mapInfo.data.splice(0, 1);
		const tileData = mapInfo.data as number[][]; // tileData[0] is height
		const mapSize = meta[0] as [number, number];
		const heights = tileData.map(data => data.splice(0, 1)[0]);

		const mapX = mapSize[0];
		const mapY = mapSize[1];
		const map = new TileMap(mapSize, heights);

		const stoneWallTextureGenerator = new StoneWallTexturePack(map, COLORS.STONE_BRICK);

		for (const y of range(mapY)) {
			for (const x of range(mapX)) {
				const index = mapX * y + x;
				const tileTypes = tileData[index];

				const pxHeight = map.getHeight(x + 1, y);
				const nxHeight = map.getHeight(x - 1, y);
				const pyHeight = map.getHeight(x, y + 1);
				const nyHeight = map.getHeight(x, y - 1);

				const stack = map.get(x, y);
				for (const z of range(stack.height)) {
					const tileType = tileTypes[z];
					const h = z + 1;
					const planeVisibility = [
						h > pxHeight,
						h > nxHeight,
						h > pyHeight,
						h > nyHeight,
						h === stack.height,
						false, // h === 0, Bottom tile is always not visible
					];

					let generator!: TextureGenerator;
					switch (tileType) {
						case TILE_TYPES.STONE_WALL:
							generator = stoneWallTextureGenerator;
							break;
						default:
							throw new Error(`Tile Type is not defined on (${x}, ${y}, ${z}) - ${tileType}`);
					}

					generator.prepare(x, y, z);
					const texturePacks = planeVisibility.map((visible, direction) => {
						if (!visible) return;

						return generator.generate(x, y, z, direction);
					});

					stack.set(z, new Tile(new THREE.Vector3(x, y, z), planeVisibility, texturePacks));
				}
			}
		}

		return map;
	}
}
