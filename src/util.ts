export function* range(end: number) {
	let n = 0;
	for (let i = 0; i < end; i += 1) {
			n++;
			yield i;
	}
	return n;
}
