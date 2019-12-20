import * as THREE from "three";
import Entity from "./Entity";
import vertexShader from "../shader/tile.vs";
import fragmentShader from "../shader/tile.fs";

export default class Tile implements Entity {
	private _mesh: THREE.Mesh;

	public get mesh() { return this._mesh; }

	public constructor() {
		const geometry = new THREE.TorusBufferGeometry(5, 1, 32, 32);
		const material = new THREE.RawShaderMaterial({
			uniforms: {
				time: { value: 0 },
			},
			vertexShader,
			fragmentShader,
		});
		this._mesh = new THREE.Mesh(geometry, material);
	}

	public update(ms: number) {
		const time = ms / 1000;

		this._mesh.rotation.set(
			Math.sin(time / 10) * 2 * Math.PI,
			Math.cos(time / 10) * 2 * Math.PI,
			0,
		);
	}
}
