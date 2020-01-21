import TileMap from "@/map/TileMap";
import { BRICK_FLOOR } from "@/const/texture";
import { DIRECTION } from "@/const/common";
import { Vec3 } from "./common";

export interface Voxel {
	color: Vec3;
	connection: {
		[DIRECTION.PX]: boolean;
		[DIRECTION.PY]: boolean;
		[DIRECTION.PZ]: boolean;
	};
}

export interface Brick {
	[BRICK_FLOOR.TOP]: Voxel[][];
	[BRICK_FLOOR.BOTTOM]: Voxel[][];
}

export interface BrickStrategyContext {
	map: TileMap;
	pos: Vec3;
	palette: Vec3[];
	neighbors: {
		[DIRECTION.NX]?: Brick,
		[DIRECTION.NY]?: Brick,
		[DIRECTION.NZ]?: Brick,
	};
}
