import { Vec3 } from "./type/common";

export function* range(end: number) {
	let n = 0;
	for (let i = 0; i < end; i += 1) {
			n++;
			yield i;
	}
	return n;
}

export function luma(col: Vec3) {
	return col[0] * 0.299 + col[1] * 0.587 + col[2] * 0.114;
}

export function parseColorHex(col: string): Vec3 {
	col = col.startsWith("#")
	? col.substr(1)
	: col;

	if (col.length === 3) {
		col = `${col[0]}${col[0]}${col[1]}${col[1]}${col[2]}${col[2]}`;
	}

	return [
		parseInt(col.substring(0, 2), 16),
		parseInt(col.substring(2, 4), 16),
		parseInt(col.substring(4, 6), 16),
	];
}

// mulberry32
let a = 0;
export function random() {
	a += 1831565813;
	let t = Math.imul(a ^ a >>> 15, 1 | a);
	t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
	return ((t ^ t >>> 14) >>> 0) / (2 ** 32);
}
