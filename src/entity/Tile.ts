import * as THREE from "three";
import Entity from "./Entity";
import vertexTopShader from "../shader/tile-top.vs";
import vertexSideShader from "../shader/tile-side.vs";
import fragmentShader from "../shader/tile.fs";
import PaletteTexture from "../palette/PaletteTexture";
import * as COLORS from "../palette/colors";

const invSQRT3 = 1 / Math.sqrt(3);

export default class Tile implements Entity {
	private _material: THREE.Material;
	private _mesh: THREE.Mesh;

	public get material() { return this._material; }
	public get mesh() { return this._mesh; }

	constructor(x: number, y: number, z: number) {
		const height = 2 * invSQRT3;
		const width = 2 * Math.SQRT2;

		const geometry = new THREE.BoxGeometry(width, width, height, 30, 30, 30);
		const topMat = new THREE.RawShaderMaterial({
			uniforms: {
				uHeightTex: new THREE.Uniform(
					new THREE.TextureLoader().load("./textures/stone_brick_height.png", tex => {
						tex.minFilter = THREE.NearestFilter;
						tex.magFilter = THREE.NearestFilter;
						tex.generateMipmaps = false;
					}),
				),
				uPaletteTex: new THREE.Uniform(
					PaletteTexture.get(COLORS.STONE_BRICK),
				),
			},
			vertexShader: vertexTopShader,
			fragmentShader,
		});
		const sideMat = new THREE.RawShaderMaterial({
			vertexShader: vertexSideShader,
			fragmentShader,
		});

		this._material = topMat;
		this._mesh = new THREE.Mesh(geometry, [sideMat, sideMat, sideMat, sideMat, topMat, sideMat]);

		const mesh = this._mesh;
		mesh.translateX(width * x);
		mesh.translateY(width * y);
		mesh.translateZ(height * z);
	}

	public update(ms: number) {}
}
