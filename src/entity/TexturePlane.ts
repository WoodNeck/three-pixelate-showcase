import * as THREE from "three";
import Entity from "./Entity";

export default class TexturePlane implements Entity {
	private _mesh: THREE.Mesh;

	public get mesh() { return this._mesh; }

	public constructor(texture: THREE.Texture) {
		const material = new THREE.MeshBasicMaterial({
			map: texture,
		});
		const geometry = new THREE.PlaneGeometry(1, 1);

		this._mesh = new THREE.Mesh(geometry, material);
	}

	public update(ms: number) {}
}
