import Tile from "@/entity/Tile";

export default class TileStack {
	private _tiles: Tile[];

	constructor(
		public readonly x: number,
		public readonly y: number,
		public readonly height: number,
	) {
		this._tiles = new Array(height);
	}

	public get(z: number) {
		return this._tiles[z];
	}

	public set(z: number, tile: Tile) {
		this._tiles[z] = tile;
	}
}
