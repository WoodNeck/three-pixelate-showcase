import { DIRECTION, DIR8 } from "@/const/common";
import { BRICK_FLOOR, GRID_INTERVAL, SIZE } from "@/const/texture";
import { Vec3 } from "@/type/common";
import { Brick, BrickStrategyContext, Voxel } from "@/type/texture";
import { range, random } from "@/util";

export default class StoneWallStrategy {
	public createBrick(ctx: BrickStrategyContext): Brick {
		const { map, pos, palette, neighbors } = ctx;
		const [x, y, z] = pos;

		const height = z + 1;
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
			isLastX, isLastY, shouldSplitZ, isToppest: false, isTopFloor: false,
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
			isTopFloor: true,
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
			isTopFloor: boolean,
		},
	): Voxel[][] {
		const width = SIZE.TOP.WIDTH / GRID_INTERVAL;
		const height = SIZE.TOP.HEIGHT / GRID_INTERVAL;
		const { isLastX, isLastY, shouldSplitZ, isToppest, isTopFloor } = brickMeta;

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
					[DIRECTION.PX]: 0,
					[DIRECTION.NX]: 0,
					[DIRECTION.PY]: 0,
					[DIRECTION.NY]: 0,
					[DIRECTION.PZ]: 0,
				};

				const isMinX = x === 0;
				const isMaxX = x === width - 1;
				const isMinY = y === 0;
				const isMaxY = y === height - 1;
				const isVoxelOnEdge = isMinX || isMaxX || isMinY || isMaxY;
				const occlusionAmount = 0.6;

				if (isVoxelOnEdge) {
					const zCheckDirs = [];

					if (isMinX) {
						zCheckDirs.push(DIR8.W);
						if (!isTopFloor && heightDiff[DIR8.W] === -1) occlusion[DIRECTION.NX] = occlusionAmount;
					} else if (isMaxX) {
						zCheckDirs.push(DIR8.E);
						if (!isTopFloor && heightDiff[DIR8.E] === -1) occlusion[DIRECTION.PX] = occlusionAmount;
					}
					if (isMinY) {
						zCheckDirs.push(DIR8.S);
						if (!isTopFloor && heightDiff[DIR8.S] === -1) occlusion[DIRECTION.NY] = occlusionAmount;
					} else if (isMaxY) {
						zCheckDirs.push(DIR8.N);
						if (!isTopFloor && heightDiff[DIR8.N] === -1) occlusion[DIRECTION.PY] = occlusionAmount;
					}

					if (isMinX && isMinY) {
						if (heightDiff[DIR8.W] === 0 && heightDiff[DIR8.S] === 0) {
							zCheckDirs.push(DIR8.SW);
						}
						if (heightDiff[DIR8.SW] >= 0) {
							occlusion[DIRECTION.NX] = occlusionAmount;
							occlusion[DIRECTION.NY] = occlusionAmount;
						}
						if (!isTopFloor && heightDiff[DIR8.SW] === -1) {
							if (heightDiff[DIR8.W] < 0) occlusion[DIRECTION.NX] = occlusionAmount;
							if (heightDiff[DIR8.S] < 0) occlusion[DIRECTION.NY] = occlusionAmount;
						}
					} else if (isMinX && isMaxY) {
						if (heightDiff[DIR8.W] === 0 && heightDiff[DIR8.N] === 0) {
							zCheckDirs.push(DIR8.NW);
						}
						if (heightDiff[DIR8.NW] >= 0) {
							occlusion[DIRECTION.NX] = occlusionAmount;
							occlusion[DIRECTION.PY] = occlusionAmount;
						}
						if (!isTopFloor && heightDiff[DIR8.NW] === -1) {
							if (heightDiff[DIR8.W] < 0) occlusion[DIRECTION.NX] = occlusionAmount;
							if (heightDiff[DIR8.N] < 0) occlusion[DIRECTION.PY] = occlusionAmount;
						}
					} else if (isMaxX && isMinY) {
						if (heightDiff[DIR8.E] === 0 && heightDiff[DIR8.S] === 0) {
							zCheckDirs.push(DIR8.SE);
						}
						if (heightDiff[DIR8.SE] >= 0) {
							occlusion[DIRECTION.PX] = occlusionAmount;
							occlusion[DIRECTION.NY] = occlusionAmount;
						}
						if (!isTopFloor && heightDiff[DIR8.SE] === -1) {
							if (heightDiff[DIR8.E] < 0) occlusion[DIRECTION.PX] = occlusionAmount;
							if (heightDiff[DIR8.S] < 0) occlusion[DIRECTION.NY] = occlusionAmount;
						}
					} else if (isMaxX && isMaxY) {
						if (heightDiff[DIR8.E] === 0 && heightDiff[DIR8.N] === 0) {
							zCheckDirs.push(DIR8.NE);
						}
						if (heightDiff[DIR8.NE] >= 0) {
							occlusion[DIRECTION.PX] = occlusionAmount;
							occlusion[DIRECTION.PY] = occlusionAmount;
						}
						if (!isTopFloor && heightDiff[DIR8.NE] === -1) {
							if (heightDiff[DIR8.E] < 0) occlusion[DIRECTION.PX] = occlusionAmount;
							if (heightDiff[DIR8.N] < 0) occlusion[DIRECTION.PY] = occlusionAmount;
						}
					}

					const isPZOccluded = zCheckDirs.some(dir => heightDiff[dir] > 0);
					occlusion[DIRECTION.PZ] = isPZOccluded ? occlusionAmount : 0;
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
