import TileStack from "./TileStack";
import { range } from "@/util";

export default class MapData {
	private _stacks: TileStack[][];

	constructor(
		public readonly size: [number, number],
		public readonly heights: number[],
	) {
		this._stacks = [...range(size[1])].map(y => {
			return [...range(size[0])].map(x => new TileStack(x, y, heights[size[1] * y + x]));
		});
	}

	public get(x: number, y: number): TileStack {
		return this._stacks[x] && this._stacks[x][y];
	}

	public getHeight(x: number, y: number): number {
		const stack = this._stacks[x] && this._stacks[x][y];

		return stack ? stack.height : 0;
	}
}
