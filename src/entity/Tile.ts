import * as THREE from "three";
import Entity from "./Entity";
import vertexShader from "../shader/tile.vs";
import fragmentShader from "../shader/tile.fs";

const invSQRT3 = 1 / Math.sqrt(3);

export default class Tile implements Entity {
	private _mesh: THREE.Mesh;

	public get mesh() { return this._mesh; }

	constructor(x: number, y: number, z: number) {
		const height = 2 * invSQRT3;
		const width = 2 * Math.SQRT2;

		const geometry = new THREE.BoxGeometry(width, width, height);
		const material = new THREE.RawShaderMaterial({
			vertexShader,
			fragmentShader,
		});
		this._mesh = new THREE.Mesh(geometry, material);

		const mesh = this._mesh;
		mesh.translateX(width * x);
		mesh.translateY(width * y);
		mesh.translateZ(height * z);
	}

	public update(ms: number) {}
}
