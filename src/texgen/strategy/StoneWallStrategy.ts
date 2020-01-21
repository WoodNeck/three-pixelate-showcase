import { DIRECTION } from "@/const/common";
import { BRICK_FLOOR, GRID_INTERVAL, SIZE } from "@/const/texture";
import { Vec3 } from "@/type/common";
import { Brick, BrickStrategyContext, Voxel } from "@/type/texture";
import { range, random } from "@/util";

export default class StoneWallStrategy {
	public createBrick(ctx: BrickStrategyContext): Brick {
		const { map, pos, palette, neighbors } = ctx;
		const [x, y, z] = pos;

		const isTopTile = z + 1 === map.getHeight(x, y);
		const bottomNeighbors = {
			[DIRECTION.NX]: neighbors[DIRECTION.NX] && neighbors[DIRECTION.NX]![BRICK_FLOOR.BOTTOM],
			[DIRECTION.NY]: neighbors[DIRECTION.NY] && neighbors[DIRECTION.NY]![BRICK_FLOOR.BOTTOM],
			[DIRECTION.NZ]: neighbors[DIRECTION.NZ] && neighbors[DIRECTION.NZ]![BRICK_FLOOR.TOP],
		};
		const bottomFloor = this._createBrickFloor(bottomNeighbors, palette, false);

		const topNeighbors = {
			[DIRECTION.NX]: neighbors[DIRECTION.NX] && neighbors[DIRECTION.NX]![BRICK_FLOOR.TOP],
			[DIRECTION.NY]: neighbors[DIRECTION.NY] && neighbors[DIRECTION.NY]![BRICK_FLOOR.TOP],
			[DIRECTION.NZ]: bottomFloor,
		};
		const topFloor = this._createBrickFloor(topNeighbors, palette, isTopTile);

		return {
			[BRICK_FLOOR.TOP]: topFloor,
			[BRICK_FLOOR.BOTTOM]: bottomFloor,
		};
	}

	/**
	 * 🡑 y
	 *   🡒 x
	 */
	private _createBrickFloor(
		neighbors: {
			[DIRECTION.NX]?: Voxel[][],
			[DIRECTION.NY]?: Voxel[][],
			[DIRECTION.NZ]?: Voxel[][],
		},
		palette: Vec3[],
		isTopTile: boolean,
	): Voxel[][] {
		const width = SIZE.TOP.WIDTH / GRID_INTERVAL;
		const height = SIZE.TOP.HEIGHT / GRID_INTERVAL;

		const voxels: Voxel[][] = [...range(width)].map(() => new Array<Voxel>(height));

		for (const x of range(width)) {
			for (const y of range(height)) {
				const nxVoxel = x === 0
					? neighbors[DIRECTION.NX]
						? neighbors[DIRECTION.NX]![width - 1][y]
						: null
					: voxels[x - 1][y];
				const nyVoxel = y === 0
					? neighbors[DIRECTION.NY]
						? neighbors[DIRECTION.NY]![x][height - 1]
						: null
					: voxels[x][y - 1];
				const nzVoxel = neighbors[DIRECTION.NZ]
					? neighbors[DIRECTION.NZ]![x][y]
					: null;
				const pxnzVoxel = neighbors[DIRECTION.NZ]
					? neighbors[DIRECTION.NZ]![x + 1] && neighbors[DIRECTION.NZ]![x + 1][y]
					: null;
				const pynzVoxel = neighbors[DIRECTION.NZ]
					? neighbors[DIRECTION.NZ]![x][y + 1]
					: null;

				const connectedNX = nxVoxel && nxVoxel.connection[DIRECTION.PX];
				const connectedNY = nyVoxel && nyVoxel.connection[DIRECTION.PY];
				const connectedNZ = nzVoxel && nzVoxel.connection[DIRECTION.PZ];
				const randomX = random();
				const randomY = random();
				const randomZ = random();

				let connectedX = pxnzVoxel && pxnzVoxel.connection[DIRECTION.PZ]
					? false
					: randomX < 0.5;
				let connectedY = pynzVoxel && pynzVoxel.connection[DIRECTION.PZ]
					? false
					: randomY < 0.5;
				let connectedZ = randomZ < 0.5;
				let color = palette[Math.floor(random() * palette.length)];

				if (connectedNZ) {
					connectedX = nzVoxel!.connection[DIRECTION.PX];
					connectedY = nzVoxel!.connection[DIRECTION.PY];
					connectedZ = false;
					color = nzVoxel!.color;
				} else {
					if (connectedNX && connectedNY) {
						connectedX = false;
						connectedY = false;
						connectedZ = nxVoxel!.connection[DIRECTION.PZ];
						color = nxVoxel!.color; // = downVoxel!.color
					} else if (connectedNX) {
						connectedX = false;
						connectedY = nxVoxel!.connection[DIRECTION.PY];
						connectedZ = nxVoxel!.connection[DIRECTION.PZ];
						color = nxVoxel!.color;
					} else if (connectedNY) {
						connectedX = nyVoxel!.connection[DIRECTION.PX];
						connectedY = false;
						connectedZ = nyVoxel!.connection[DIRECTION.PZ];
						color = nyVoxel!.color;
					}
				}

				voxels[x][y] = {
					color,
					connection: {
						[DIRECTION.PX]: connectedX,
						[DIRECTION.PY]: connectedY,
						[DIRECTION.PZ]: connectedZ,
					},
				};
			}
		}

		return voxels;
	}
}
