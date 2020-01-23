import { DIRECTION, DIR8 } from "@/const/common";
import { BRICK_FLOOR, GRID_INTERVAL, SIZE } from "@/const/texture";
import { Vec3 } from "@/type/common";
import { Brick, BrickStrategyContext, Voxel } from "@/type/texture";
import { range, random } from "@/util";

export default class StoneWallStrategy {
	public createBrick(ctx: BrickStrategyContext): Brick {
		const { map, pos, palette, neighbors } = ctx;
		const [x, y, z] = pos;

		const height = map.getHeight(x, y);
		const heightDiff = {
			[DIR8.NW]: map.getHeight(x - 1, y + 1) - height,
			[DIR8.N]: map.getHeight(x, y + 1) - height,
			[DIR8.NE]: map.getHeight(x + 1, y + 1) - height,
			[DIR8.W]: map.getHeight(x - 1, y) - height,
			[DIR8.E]: map.getHeight(x + 1, y) - height,
			[DIR8.SW]: map.getHeight(x - 1, y - 1) - height,
			[DIR8.S]: map.getHeight(x, y - 1) - height,
			[DIR8.SE]: map.getHeight(x + 1, y - 1) - height,
		};

		const isLastX = x + 1 === map.size[0]
			|| z >= map.getHeight(x + 1, y)
			|| z < map.getHeight(x + 1, y - 1);
		const isLastY = y + 1 === map.size[1]
			|| z >= map.getHeight(x, y + 1)
			|| z < map.getHeight(x + 1, y + 1);
		const shouldSplitX = z + 1 === map.getHeight(x + 1, y);
		const shouldSplitY = z + 1 === map.getHeight(x, y + 1);
		const shouldSplitZ = z === map.getHeight(x, y - 1)
			|| z === map.getHeight(x - 1, y);
		const isToppest = z + 1 === height;

		const bottomNeighbors = {
			[DIRECTION.NX]: neighbors[DIRECTION.NX] && neighbors[DIRECTION.NX]![BRICK_FLOOR.BOTTOM],
			[DIRECTION.NY]: neighbors[DIRECTION.NY] && neighbors[DIRECTION.NY]![BRICK_FLOOR.BOTTOM],
			[DIRECTION.NZ]: neighbors[DIRECTION.NZ] && neighbors[DIRECTION.NZ]![BRICK_FLOOR.TOP],
		};
		const bottomFloor = this._createBrickFloor(bottomNeighbors, heightDiff, palette, {
			isLastX, isLastY, shouldSplitZ, isToppest: false,
		});

		const topNeighbors = {
			[DIRECTION.NX]: neighbors[DIRECTION.NX] && neighbors[DIRECTION.NX]![BRICK_FLOOR.TOP],
			[DIRECTION.NY]: neighbors[DIRECTION.NY] && neighbors[DIRECTION.NY]![BRICK_FLOOR.TOP],
			[DIRECTION.NZ]: bottomFloor,
		};
		const topFloor = this._createBrickFloor(topNeighbors, heightDiff, palette, {
			isLastX: isLastX || shouldSplitX,
			isLastY: isLastY || shouldSplitY,
			shouldSplitZ: isToppest,
			isToppest,
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
		heightDiff: {
			[DIR8.NW]: number;
			[DIR8.N]: number;
			[DIR8.NE]: number;
			[DIR8.W]: number;
			[DIR8.E]: number;
			[DIR8.SW]: number;
			[DIR8.S]: number;
			[DIR8.SE]: number;
		},
		palette: Vec3[],
		brickMeta: {
			isLastX: boolean,
			isLastY: boolean,
			shouldSplitZ: boolean,
			isToppest: boolean,
		},
	): Voxel[][] {
		const width = SIZE.TOP.WIDTH / GRID_INTERVAL;
		const height = SIZE.TOP.HEIGHT / GRID_INTERVAL;
		const { isLastX, isLastY, shouldSplitZ, isToppest } = brickMeta;

		const voxels: Voxel[][] = [...range(width)].map(() => new Array<Voxel>(height));

		for (const y of range(height)) {
			for (const x of range(width)) {
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
				let connectedNZ = shouldSplitZ || !nzVoxel || nzVoxel.connection[DIRECTION.NZ]
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

				// Ambient occlusion calculation based of neighbor heights.
				const occlusion = {
					[DIRECTION.PX]: 1,
					[DIRECTION.NX]: 1,
					[DIRECTION.PY]: 1,
					[DIRECTION.NY]: 1,
					[DIRECTION.PZ]: 1,
				};

				if (isToppest) {
					const tangents = [
						Math.atan2(Math.max(heightDiff[DIR8.E], 0), (width - x)),
						Math.atan2(Math.max(heightDiff[DIR8.W], 0), (x + 1)),
						Math.atan2(Math.max(heightDiff[DIR8.N], 0), (height - y)),
						Math.atan2(Math.max(heightDiff[DIR8.S], 0), (y + 1)),
					];
					const avgOcclusion = tangents.map(val => Math.max(val, 0) / (Math.PI / 2))
						.reduce((sum, tangent) => sum + tangent, 0) / tangents.length;
					occlusion[DIRECTION.PZ] = Math.max(avgOcclusion, 0);
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
					occlusion,
				};
			}
		}

		return voxels;
	}
}
