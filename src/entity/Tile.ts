import * as THREE from "three";

import Entity from "./Entity";
import vertexShader from "@/shader/tile.vs";
import fragmentShader from "@/shader/tile.fs";
import { DIRECTION } from "@/const/common";
import { TexturePack } from "@/type/common";

const depthModifier = 2 / Math.sqrt(3);
const widthModifier = 2 * Math.SQRT2;

export default class Tile implements Entity {
	private _mesh: THREE.Mesh;

	public get mesh() { return this._mesh; }

	constructor(
		public readonly pos: THREE.Vector3,
		planeVisibility: boolean[],
		texturePacks: TexturePack[],
	) {
		const mergedGeometry = new THREE.Geometry();
		let visibleIndex = 0;
		planeVisibility.forEach((visible, idx) => {
			if (!visible) return;

			let geometry!: THREE.PlaneGeometry;
			switch (idx) {
				case DIRECTION.PX:
				case DIRECTION.NX:
				case DIRECTION.PY:
				case DIRECTION.NY:
					geometry = new THREE.PlaneGeometry(widthModifier, depthModifier);
					break;
				case DIRECTION.PZ:
				case DIRECTION.NZ:
					geometry = new THREE.PlaneGeometry(widthModifier, widthModifier);
					break;
			}

			const mesh = new THREE.Mesh(geometry);

			switch (idx) {
				case DIRECTION.PX:
					mesh.rotateX(THREE.Math.DEG2RAD * 90);
					mesh.rotateY(THREE.Math.DEG2RAD * 90);
					mesh.translateZ(widthModifier / 2);
					break;
				case DIRECTION.NX:
					mesh.rotateX(THREE.Math.DEG2RAD * 90);
					mesh.rotateY(-THREE.Math.DEG2RAD * 90);
					mesh.translateZ(widthModifier / 2);
					break;
				case DIRECTION.PY:
					mesh.rotateX(THREE.Math.DEG2RAD * 90);
					mesh.rotateY(-THREE.Math.DEG2RAD * 180);
					mesh.translateZ(widthModifier / 2);
					break;
				case DIRECTION.NY:
					mesh.rotateX(THREE.Math.DEG2RAD * 90);
					mesh.translateZ(widthModifier / 2);
					break;
				case DIRECTION.PZ:
					mesh.translateZ(depthModifier / 2);
					break;
				case DIRECTION.NZ:
					mesh.rotateX(THREE.Math.DEG2RAD * 180);
					mesh.translateZ(depthModifier / 2);
					break;
			}

			mesh.updateMatrix();

			mergedGeometry.merge(mesh.geometry as THREE.Geometry, mesh.matrix, visibleIndex);
			visibleIndex += 1;
		});

		const materials = planeVisibility.map((visible, idx) => {
			if (!visible) return;
			return this._createMaterial(texturePacks[idx]);
		}).filter(val => val);

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

	private _createMaterial(texturePack: TexturePack) {
		const uniforms = THREE.UniformsUtils.merge([
			THREE.UniformsLib.lights,
			{
				albedoMap: new THREE.Uniform(texturePack.albedoMap),
				displacementMap: new THREE.Uniform(texturePack.displacementMap),
				aoMap: new THREE.Uniform(texturePack.aoMap),
				normalMap: new THREE.Uniform(texturePack.normalMap),
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
