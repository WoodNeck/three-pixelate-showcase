import { DIRECTION } from "@/const/common";
import { BRICK_FLOOR, GRID_INTERVAL, SIZE } from "@/const/texture";
import { Vec3 } from "@/type/common";
import { Brick, BrickStrategyContext, Voxel } from "@/type/texture";
import { range, random } from "@/util";

export default class StoneWallStrategy {
	public createBrick(ctx: BrickStrategyContext): Brick {
		const { map, pos, palette, neighbors } = ctx;
		const [x, y, z] = pos;

		const isLastX = x + 1 === map.size[0]
			|| z >= map.getHeight(x + 1, y)
			|| z < map.getHeight(x + 1, y - 1);
		const isLastY = y + 1 === map.size[1]
			|| z >= map.getHeight(x, y + 1)
			|| z < map.getHeight(x + 1, y + 1);
		const isToppest = z + 1 === map.getHeight(x, y);
		const bottomNeighbors = {
			[DIRECTION.NX]: neighbors[DIRECTION.NX] && neighbors[DIRECTION.NX]![BRICK_FLOOR.BOTTOM],
			[DIRECTION.NY]: neighbors[DIRECTION.NY] && neighbors[DIRECTION.NY]![BRICK_FLOOR.BOTTOM],
			[DIRECTION.NZ]: neighbors[DIRECTION.NZ] && neighbors[DIRECTION.NZ]![BRICK_FLOOR.TOP],
		};
		const bottomFloor = this._createBrickFloor(bottomNeighbors, palette, {
			isLastX, isLastY, isToppest,
		});

		const topNeighbors = {
			[DIRECTION.NX]: neighbors[DIRECTION.NX] && neighbors[DIRECTION.NX]![BRICK_FLOOR.TOP],
			[DIRECTION.NY]: neighbors[DIRECTION.NY] && neighbors[DIRECTION.NY]![BRICK_FLOOR.TOP],
			[DIRECTION.NZ]: bottomFloor,
		};
		const topFloor = this._createBrickFloor(topNeighbors, palette, {
			isLastX, isLastY, isToppest,
		});

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
		brickMeta: {
			isToppest: boolean,
			isLastX: boolean,
			isLastY: boolean,
		},
	): Voxel[][] {
		const width = SIZE.TOP.WIDTH / GRID_INTERVAL;
		const height = SIZE.TOP.HEIGHT / GRID_INTERVAL;
		const { isToppest, isLastX, isLastY } = brickMeta;

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

				let connectedNX = !!nxVoxel && nxVoxel.connection[DIRECTION.PX];
				const connectedNY = !!nyVoxel && nyVoxel.connection[DIRECTION.PY];
				const connectedPZ = false;
				const randomX = random();
				const randomY = random();
				const randomZ = random();

				let connectedPX = !(isLastX && x === width - 1) && randomX < 0.5;
				let connectedPY = !(isLastY && y === height - 1) && randomY < 0.5;
				let connectedNZ = !nzVoxel || nzVoxel.connection[DIRECTION.NZ]
					? false
					: nzVoxel.connection[DIRECTION.NX] !== connectedNX || nzVoxel.connection[DIRECTION.NY] !== connectedNY
						? false
						: randomZ < 0.5;
				let color = palette[Math.floor(random() * palette.length)];

				if (connectedNX && connectedNY) {
					if (nxVoxel!.connection[DIRECTION.NY] && nyVoxel!.connection[DIRECTION.NX]) {
						connectedPX = false;
						connectedPY = false;
						connectedNZ = nxVoxel!.connection[DIRECTION.NZ];
						color = nxVoxel!.color; // = downVoxel!.color
					} else {
						connectedPX = nyVoxel!.connection[DIRECTION.PX];
						connectedPY = false;
						connectedNZ = nyVoxel!.connection[DIRECTION.NZ];
						color = nyVoxel!.color;

						connectedNX = false;
						nxVoxel!.connection[DIRECTION.PX] = false;
					}
				} else if (connectedNX) {
					connectedPX = false;
					connectedPY = nxVoxel!.connection[DIRECTION.PY];
					connectedNZ = nxVoxel!.connection[DIRECTION.NZ];
					color = nxVoxel!.color;
				} else if (connectedNY) {
					connectedPX = nyVoxel!.connection[DIRECTION.PX];
					connectedPY = false;
					connectedNZ = nyVoxel!.connection[DIRECTION.NZ];
					color = nyVoxel!.color;
				}

				if (connectedNZ) {
					connectedPX = nzVoxel!.connection[DIRECTION.PX];
					connectedPY = nzVoxel!.connection[DIRECTION.PY];
					nzVoxel!.connection[DIRECTION.PZ] = true;
					color = nzVoxel!.color;
				}

				voxels[x][y] = {
					color,
					connection: {
						[DIRECTION.PX]: connectedPX,
						[DIRECTION.NX]: connectedNX,
						[DIRECTION.PY]: connectedPY,
						[DIRECTION.NY]: connectedNY,
						[DIRECTION.PZ]: connectedPZ,
						[DIRECTION.NZ]: connectedNZ,
					},
				};
			}
		}

		return voxels;
	}
}
