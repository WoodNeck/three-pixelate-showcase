import * as THREE from "three";

import Entity from "./Entity";
import vertexShader from "@/shader/tile.vs";
import fragmentShader from "@/shader/tile.fs";
import Map from "@/map/Map";
import StoneWallTexturePack from "@/texgen/StoneWallTexturePack";
import { TILE_SIDE } from "@/const";

const depthModifier = 2 / Math.sqrt(3);
const widthModifier = 2 * Math.SQRT2;

export default class Tile implements Entity {
	private _mesh: THREE.Mesh;

	public get mesh() { return this._mesh; }

	constructor(
		public readonly pos: THREE.Vector3,
		planeVisibility: boolean[],
		map: Map,
	) {
		let visiblePlaneCount = 0;
		const mergedGeometry = new THREE.Geometry();
		const materials = planeVisibility.map((visible, idx) => {
			if (!visible) return;

			let geometry!: THREE.PlaneGeometry;
			let material!: THREE.RawShaderMaterial;

			switch (idx) {
				case 0:
					// +X
					geometry = new THREE.PlaneGeometry(widthModifier, depthModifier);
					material = this._createSideMaterial(map, TILE_SIDE.PX);
					break;
				case 1:
					// -X
					geometry = new THREE.PlaneGeometry(widthModifier, depthModifier);
					material = this._createSideMaterial(map, TILE_SIDE.NX);
					break;
				case 2:
					// +Y
					geometry = new THREE.PlaneGeometry(widthModifier, depthModifier);
					material = this._createSideMaterial(map, TILE_SIDE.PY);
					break;
				case 3:
					// -Y
					geometry = new THREE.PlaneGeometry(widthModifier, depthModifier);
					material = this._createSideMaterial(map, TILE_SIDE.NY);
					break;
				case 4:
				case 5:
					// Z
					geometry = new THREE.PlaneGeometry(widthModifier, widthModifier);
					material = this._createTopMaterial(map);
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

	private _createTopMaterial(map: Map) {
		const texturePack = new StoneWallTexturePack(this.pos, map);
		const textures = texturePack.generateTop();

		const uniforms = THREE.UniformsUtils.merge([
			THREE.UniformsLib.lights,
			{
				albedoMap: new THREE.Uniform(textures.albedoMap),
				displacementMap: new THREE.Uniform(textures.displacementMap),
				aoMap: new THREE.Uniform(textures.aoMap),
				normalMap: new THREE.Uniform(textures.normalMap),
			},
		]);

		return new THREE.RawShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
			lights: true,
		});
	}

	private _createSideMaterial(map: Map, side: TILE_SIDE) {
		const texturePack = new StoneWallTexturePack(this.pos, map);
		const textures = texturePack.generateSide(side);

		const uniforms = THREE.UniformsUtils.merge([
			THREE.UniformsLib.lights,
			{
				albedoMap: new THREE.Uniform(textures.albedoMap),
				displacementMap: new THREE.Uniform(textures.displacementMap),
				aoMap: new THREE.Uniform(textures.aoMap),
				normalMap: new THREE.Uniform(textures.normalMap),
			},
		]);

		return new THREE.RawShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
			lights: true,
		});
	}
}
