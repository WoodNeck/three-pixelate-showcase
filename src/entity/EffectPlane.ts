import * as THREE from "three";

import Entity from "./Entity";

export default class EffectPlane implements Entity {
	private _material: THREE.RawShaderMaterial;
	private _mesh: THREE.Mesh;

	public get material() { return this._material; }
	public get mesh() { return this._mesh; }

	constructor(uniforms: {[key: string]: any}, vs: string, fs: string) {
		const material = new THREE.RawShaderMaterial({
			uniforms,
			vertexShader: vs,
			fragmentShader: fs,
		});
		const geometry = new THREE.PlaneGeometry(1, 1);

		this._mesh = new THREE.Mesh(geometry, material);
		this._material = material;
	}

	public update(ms: number) {
		this._material.needsUpdate = true;
	}
}
