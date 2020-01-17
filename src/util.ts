import { Vec3 } from "./type";

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

export function random(seed: number) {
	return (Math.imul(741103597, seed) >>> 0) / (2 ** 32);
}
