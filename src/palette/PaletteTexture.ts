import * as THREE from "three";
import COLORS from "./colors";
import { range } from "../util";

type Vec3 = [number, number, number];

export default class PaletteTexture {
	public static generate() {
		const texWidth = 64;
		const texSize = texWidth * texWidth;
		const colorData = new Uint8Array(3 * texSize);

		const palette: Vec3[] = COLORS.map(col => {
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

		const rgbOffset = 16;
		const rgbOffsetSquare = rgbOffset * rgbOffset;

		for (const colorVal of range(4096)) {
			const color: Vec3 = [
				Math.floor(colorVal / rgbOffsetSquare) * 16,
				Math.floor((colorVal % rgbOffsetSquare) / rgbOffset) * 16,
				Math.floor(colorVal % rgbOffset) * 16,
			];
			let closestIndex = 0;
			let closestDiff = Infinity;

			for (const paletteIndex of range(palette.length)) {
				const colorDiff = diff(color, palette[paletteIndex]);

				if (colorDiff < closestDiff) {
					closestIndex = paletteIndex;
					closestDiff = colorDiff;
				}
			}

			const closestColor = palette[closestIndex];
			const dataIndex = 3 * colorVal;
			colorData[dataIndex + 0] = closestColor[0]; // R;
			colorData[dataIndex + 1] = closestColor[1]; // G;
			colorData[dataIndex + 2] = closestColor[2]; // B;
		}

		const texture = new THREE.DataTexture(colorData, texWidth, texWidth, THREE.RGBFormat);

		texture.flipY = false;
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		texture.generateMipmaps = false;
		texture.needsUpdate = true;

		return texture;
	}

}
