import * as THREE from "three";

import { DIRECTION, DIR8 } from "@/const/common";
import { BRICK_FLOOR, GRID_INTERVAL, SIZE } from "@/const/texture";
import { Vec3 } from "@/type/common";
import { Brick, BrickStrategyContext, Voxel } from "@/type/texture";
import { range, random } from "@/util";
import TileMap from "@/map/TileMap";

export default class StoneWallStrategy {
	public createBrick(ctx: BrickStrategyContext): Brick {
		const { map, pos, palette, neighbors } = ctx;
		const [x, y, z] = pos;

		const height = z + 1;
		const isToppest = z + 1 === map.getHeight(x, y);
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
			|| heightDiff[DIR8.E] < 0
			|| heightDiff[DIR8.SE] >= 0;
		const isLastY = y + 1 === map.size[1]
			|| heightDiff[DIR8.N] < 0
			|| heightDiff[DIR8.NE] >= 0;
		const shouldSplitX = heightDiff[DIR8.E] === 0;
		const shouldSplitY = heightDiff[DIR8.N] === 0;
		const shouldSplitZ = heightDiff[DIR8.S] === -1 || heightDiff[DIR8.W] === -1;

		const bottomNeighbors = {
			[DIRECTION.NX]: neighbors[DIRECTION.NX] && neighbors[DIRECTION.NX]![BRICK_FLOOR.BOTTOM],
			[DIRECTION.NY]: neighbors[DIRECTION.NY] && neighbors[DIRECTION.NY]![BRICK_FLOOR.BOTTOM],
			[DIRECTION.NZ]: neighbors[DIRECTION.NZ] && neighbors[DIRECTION.NZ]![BRICK_FLOOR.TOP],
		};
		const bottomFloor = this._createBrickFloor(map, pos, palette, {
			neighbors: bottomNeighbors,
			isLastX,
			isLastY,
			shouldSplitZ,
			isToppest: false,
		});

		const topNeighbors = {
			[DIRECTION.NX]: neighbors[DIRECTION.NX] && neighbors[DIRECTION.NX]![BRICK_FLOOR.TOP],
			[DIRECTION.NY]: neighbors[DIRECTION.NY] && neighbors[DIRECTION.NY]![BRICK_FLOOR.TOP],
			[DIRECTION.NZ]: bottomFloor,
		};
		const topFloor = this._createBrickFloor(map, pos, palette, {
			neighbors: topNeighbors,
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
		map: TileMap,
		pos: Vec3,
		palette: Vec3[],
		brickMeta: {
			neighbors: {
				[DIRECTION.NX]?: Voxel[][],
				[DIRECTION.NY]?: Voxel[][],
				[DIRECTION.NZ]?: Voxel[][],
			},
			isLastX: boolean,
			isLastY: boolean,
			shouldSplitZ: boolean,
			isToppest: boolean,
		},
	): Voxel[][] {
		const width = SIZE.TOP.WIDTH / GRID_INTERVAL;
		const height = SIZE.TOP.HEIGHT / GRID_INTERVAL;
		const { neighbors, isLastX, isLastY, shouldSplitZ, isToppest } = brickMeta;

		const [x, y, z] = pos;
		const voxels: Voxel[][] = [...range(width)].map(() => new Array<Voxel>(height));

		for (const voxY of range(height)) {
			for (const voxX of range(width)) {
				const nxVoxel = voxX === 0
					? neighbors[DIRECTION.NX]
						? neighbors[DIRECTION.NX]![width - 1][voxY]
						: null
					: voxels[voxX - 1][voxY];
				const nyVoxel = voxY === 0
					? neighbors[DIRECTION.NY]
						? neighbors[DIRECTION.NY]![voxX][height - 1]
						: null
					: voxels[voxX][voxY - 1];
				const nzVoxel = neighbors[DIRECTION.NZ]
					? neighbors[DIRECTION.NZ]![voxX][voxY]
					: null;

				let connectedNX = !!nxVoxel && nxVoxel.connection[DIRECTION.PX];
				const connectedNY = !!nyVoxel && nyVoxel.connection[DIRECTION.PY];
				const connectedPZ = false;
				const randomX = random();
				const randomY = random();
				const randomZ = random();

				let connectedPX = !(isLastX && voxX === width - 1) && randomX < 0.5;
				let connectedPY = !(isLastY && voxY === height - 1) && randomY < 0.5;
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

				voxels[voxX][voxY] = {
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
