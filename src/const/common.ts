export enum DIRECTION {
	PX,
	NX,
	PY,
	NY,
	PZ,
	NZ,
}

// 8-Direction, E = +x, N = +y
export enum DIR8 {
	NW, N, NE,
	W,      E,
	SW, S, SE,
}

export enum TILE_TYPES {
	STONE_WALL,   // 0
	WOODEN_PLANK, // 1
	GRAVEL,       // 2
	WATER,        // 3
	GRASS,        // 4
	ROCKY_GROUND, // 5
	DIRT,         // 6
}
