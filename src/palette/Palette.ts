import * as THREE from "three";
import * as COLORS from "./colors";
import { range } from "../util";

type Vec3 = [number, number, number];

export default class Palette {
	private _texture: THREE.DataTexture;
	private _ditherTexture: THREE.DataTexture;

	public get texture() { return this._texture; }
	public get ditherTexture() { return this._ditherTexture; }

	constructor() {
		const texWidth = 64;
		const texSize = texWidth * texWidth;
		const colorData = new Uint8Array(3 * texSize);
		const secondColorData = new Uint8Array(3 * texSize);

		const palette: Vec3[] = COLORS.SWEETIE16.map(col => {
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
		});

		const diff = (col1: Vec3, col2: Vec3) => {
			const r = col1[0] - col2[0];
			const g = col1[1] - col2[1];
			const b = col1[2] - col2[2];
			return r * r + g * g + b * b;
		};

		const secondClosestIndex = palette.map((col, curIdx) => {
			let closestIdx = 0;
			let closestDist = Infinity;

			palette.forEach((otherCol, otherIdx) => {
				if (otherIdx === curIdx) return;

				const dist = diff(col, otherCol);
				if (dist < closestDist) {
					closestDist = dist;
					closestIdx = otherIdx;
				}
			});

			return closestIdx;
		});

		const rgbOffset = 16;
		const rgbOffsetSquare = rgbOffset * rgbOffset;

		for (const colorVal of range(4096)) {
			const color: Vec3 = [
				Math.floor(colorVal / rgbOffsetSquare) * 16,
				Math.floor((colorVal % rgbOffsetSquare) / rgbOffset) * 16,
				Math.floor(colorVal % rgbOffset) * 16,
			];
			let closestIndex = 0;
			let closestDist = Infinity;

			for (const paletteIndex of range(palette.length)) {
				const colorDiff = diff(color, palette[paletteIndex]);

				if (colorDiff < closestDist) {
					closestIndex = paletteIndex;
					closestDist = colorDiff;
				}
			}

			const closestColor = palette[closestIndex];
			const secondColor = palette[secondClosestIndex[closestIndex]];
			const dataIndex = 3 * colorVal;

			colorData[dataIndex + 0] = closestColor[0]; // R;
			colorData[dataIndex + 1] = closestColor[1]; // G;
			colorData[dataIndex + 2] = closestColor[2]; // B;
			secondColorData[dataIndex + 0] = secondColor[0]; // R;
			secondColorData[dataIndex + 1] = secondColor[1]; // G;
			secondColorData[dataIndex + 2] = secondColor[2]; // B;
		}

		const texture = new THREE.DataTexture(colorData, texWidth, texWidth, THREE.RGBFormat);
		const ditherTexture = new THREE.DataTexture(secondColorData, texWidth, texWidth, THREE.RGBFormat);

		texture.flipY = false;
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		texture.generateMipmaps = false;
		texture.needsUpdate = true;

		ditherTexture.flipY = false;
		ditherTexture.magFilter = THREE.NearestFilter;
		ditherTexture.minFilter = THREE.NearestFilter;
		ditherTexture.generateMipmaps = false;
		ditherTexture.needsUpdate = true;

		this._texture = texture;
		this._ditherTexture = ditherTexture;
	}
}
