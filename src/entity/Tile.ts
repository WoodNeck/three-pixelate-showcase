import * as THREE from "three";
import Entity from "./Entity";
import vertexShader from "../shader/tile.vs";
import fragmentShader from "../shader/tile.fs";

export default class Tile implements Entity {
	private _mesh: THREE.Mesh;

	public get mesh() { return this._mesh; }

	constructor(x: number, y: number, z: number) {
		const height = 1;
		const h2 = height * 2 * Math.SQRT2;

		const geometry = new THREE.BoxGeometry(h2, h2, height);
		const material = new THREE.RawShaderMaterial({
			vertexShader,
			fragmentShader,
		});
		this._mesh = new THREE.Mesh(geometry, material);
		this._mesh.translateX(h2 * x);
		this._mesh.translateY(h2 * y);
		this._mesh.translateZ(height * z);
	}

	public update(ms: number) {}
}
