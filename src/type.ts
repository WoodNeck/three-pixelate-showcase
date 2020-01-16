export type Vec3 = [number, number, number];

export interface Palette {
	name: string;
	colors: string[];
}

export interface Updateable {
	update(ms: number): void;
}
