import * as THREE from "three";
import Entity from "./Entity";
import TileGeometry from "../geometry/TileGeometry";
import vertexTopShader from "../shader/tile-top.vs";
import vertexSideShader from "../shader/tile-side.vs";
import fragTopShader from "../shader/tile-top.fs";
import fragSideShader from "../shader/tile-side.fs";
import PaletteTexture from "../palette/PaletteTexture";
import * as COLORS from "../palette/colors";

const depthModifier = 2 / Math.sqrt(3);
const widthModifier = 2 * Math.SQRT2;

export default class Tile implements Entity {
	private _material: THREE.Material;
	private _mesh: THREE.Mesh;

	public get material() { return this._material; }
	public get mesh() { return this._mesh; }

	constructor(x: number, y: number, z: number) {
		const geometry = new TileGeometry(widthModifier, widthModifier, depthModifier);

		const topMat = new THREE.RawShaderMaterial({
			uniforms: {
				uTex: new THREE.Uniform(
					new THREE.TextureLoader().load("./textures/stone_top.png", tex => {
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
			fragmentShader: fragTopShader,
		});
		const sideMat1 = new THREE.RawShaderMaterial({
			uniforms: {
				uTex: new THREE.Uniform(
					new THREE.TextureLoader().load("./textures/stone_side1.png", tex => {
						tex.minFilter = THREE.NearestFilter;
						tex.magFilter = THREE.NearestFilter;
						tex.generateMipmaps = false;
					}),
				),
			},
			vertexShader: vertexSideShader,
			fragmentShader: fragSideShader,
		});
		const sideMat2 = new THREE.RawShaderMaterial({
			uniforms: {
				uTex: new THREE.Uniform(
					new THREE.TextureLoader().load("./textures/stone_side2.png", tex => {
						tex.minFilter = THREE.NearestFilter;
						tex.magFilter = THREE.NearestFilter;
						tex.generateMipmaps = false;
					}),
				),
			},
			vertexShader: vertexSideShader,
			fragmentShader: fragSideShader,
		});

		this._material = topMat;
		this._mesh = new THREE.Mesh(geometry, [sideMat2, sideMat2, sideMat1, sideMat1, topMat, topMat]);

		const mesh = this._mesh;
		mesh.translateX(widthModifier * x);
		mesh.translateY(widthModifier * y);
		mesh.translateZ(depthModifier * z);
	}

	public update(ms: number) {}
}
