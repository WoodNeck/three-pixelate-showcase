import * as THREE from "three";

import Entity from "./Entity";
import vertexTopShader from "@/shader/tile-top.vs";
import vertexSideShader from "@/shader/tile-side.vs";
import fragTopShader from "@/shader/tile-top.fs";
import fragSideShader from "@/shader/tile-side.fs";
import PaletteTexture from "@/palette/PaletteTexture";
import StoneWallTexturePack from "@/texgen/StoneWallTexturePack";
import * as COLORS from "@/palette/colors";

const depthModifier = 2 / Math.sqrt(3);
const widthModifier = 2 * Math.SQRT2;

export default class Tile implements Entity {
	private _mesh: THREE.Mesh;

	public get mesh() { return this._mesh; }

	constructor(
		public readonly pos: THREE.Vector3,
		planeVisibility: boolean[],
	) {
		let visiblePlaneCount = 0;
		const mergedGeometry = new THREE.Geometry();
		const materials = planeVisibility.map((visible, idx) => {
			if (!visible) return;

			let geometry!: THREE.PlaneGeometry;
			let material!: THREE.RawShaderMaterial;

			switch (idx) {
				case 0:
				case 1:
					// X
					geometry = new THREE.PlaneGeometry(widthModifier, depthModifier);
					material = this._createSideXMaterial();
					break;
				case 2:
				case 3:
					// Y
					geometry = new THREE.PlaneGeometry(widthModifier, depthModifier);
					material = this._createSideYMaterial();
					break;
				case 4:
				case 5:
					// Z
					geometry = new THREE.PlaneGeometry(widthModifier, widthModifier);
					material = this._createTopMaterial();
					break;
			}

			const mesh = new THREE.Mesh(geometry!, material!);

			switch (idx) {
				case 0:
					// +X
					mesh.rotateX(THREE.Math.DEG2RAD * 90);
					mesh.rotateY(THREE.Math.DEG2RAD * 90);
					mesh.translateZ(widthModifier / 2);
					break;
				case 1:
					// -X
					mesh.rotateX(THREE.Math.DEG2RAD * 90);
					mesh.rotateY(-THREE.Math.DEG2RAD * 90);
					mesh.translateZ(widthModifier / 2);
					break;
				case 2:
					// +Y
					mesh.rotateX(THREE.Math.DEG2RAD * 90);
					mesh.rotateY(-THREE.Math.DEG2RAD * 180);
					mesh.translateZ(widthModifier / 2);
					break;
				case 3:
					// -Y
					mesh.rotateX(THREE.Math.DEG2RAD * 90);
					mesh.translateZ(widthModifier / 2);
					break;
				case 4:
					// +Z
					mesh.translateZ(depthModifier / 2);
					break;
				case 5:
					// -Z
					mesh.rotateX(THREE.Math.DEG2RAD * 180);
					mesh.translateZ(depthModifier / 2);
					break;
			}

			mesh.updateMatrix();

			mergedGeometry.merge(mesh!.geometry as THREE.Geometry, mesh!.matrix, visiblePlaneCount);
			visiblePlaneCount += 1;

			return material!;
		}).filter(val => !!val);

		this._mesh = new THREE.Mesh(mergedGeometry, materials as THREE.RawShaderMaterial[]);
		this._mesh.position.add(
			new THREE.Vector3(
				widthModifier * pos.x,
				widthModifier * pos.y,
				depthModifier * pos.z,
			),
		);
	}

	public update(ms: number) {}

	private _createTopMaterial() {
		return new THREE.RawShaderMaterial({
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
	}

	private _createSideXMaterial() {
		const texturePack = new StoneWallTexturePack(16, 8, this.pos);

		return new THREE.RawShaderMaterial({
			uniforms: {
				albedoMap: new THREE.Uniform(texturePack.albedoMap),
				displacementMap: new THREE.Uniform(texturePack.displacementMap),
				aoMap: new THREE.Uniform(texturePack.aoMap),
				normalMap: new THREE.Uniform(texturePack.normalMap),
			},
			vertexShader: vertexSideShader,
			fragmentShader: fragSideShader,
		});
	}

	private _createSideYMaterial() {
		const texturePack = new StoneWallTexturePack(16, 8, this.pos);

		return new THREE.RawShaderMaterial({
			uniforms: {
				albedoMap: new THREE.Uniform(texturePack.albedoMap),
				displacementMap: new THREE.Uniform(texturePack.displacementMap),
				aoMap: new THREE.Uniform(texturePack.aoMap),
				normalMap: new THREE.Uniform(texturePack.normalMap),
			},
			vertexShader: vertexSideShader,
			fragmentShader: fragSideShader,
		});
	}
}
