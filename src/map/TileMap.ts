import TileStack from "./TileStack";
import { range } from "@/util";

export default class TileMap {
	private _stacks: TileStack[][];

	constructor(
		public readonly size: [number, number],
		heights: number[],
	) {
		this._stacks = [...range(size[1])].map(y => {
			return [...range(size[0])].map(x => new TileStack(x, y, heights[size[0] * y + x]));
		});
	}

	public get(x: number, y: number): TileStack {
		return this._stacks[y] && this._stacks[y][x];
	}

	public getHeight(x: number, y: number): number {
		const stack = this._stacks[y] && this._stacks[y][x];

		return stack ? stack.height : 0;
	}
}
