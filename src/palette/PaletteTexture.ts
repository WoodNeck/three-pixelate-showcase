import * as THREE from "three";

import { range, luma } from "@/util";
import { Palette, Vec3 } from "@/type";

const textures: Map<string, THREE.DataTexture> = new Map();

// Singleton
export default class PaletteTexture {
	public static get(palette: Palette) {
		if (textures.has(palette.name)) {
			return textures.get(palette.name);
		} else {
			const newTex = PaletteTexture._generateFrom(palette);
			textures.set(palette.name, newTex);
			return newTex;
		}
	}

	private static _generateFrom(palette: Palette): THREE.DataTexture {
		const texWidth = 64;
		const texSize = texWidth * texWidth;
		const colorData = new Uint8Array(3 * texSize);

		const colors: Vec3[] = palette.colors.map(col => {
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
			const lumaDiff = luma(col1) - luma(col2);
			return lumaDiff * lumaDiff;
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
			let closestDist = Infinity;

			for (const paletteIndex of range(colors.length)) {
				const colorDiff = diff(color, colors[paletteIndex]);

				if (colorDiff < closestDist) {
					closestIndex = paletteIndex;
					closestDist = colorDiff;
				}
			}

			const closestColor = colors[closestIndex];
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
