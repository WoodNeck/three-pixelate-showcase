/*
 * Shape.ts
 * ===========
 * Placeholder shape to demonstrate setup works.
 * Has capacity to import custom .glsl shader files
 */

import * as THREE from "three";

import vertShader from "../glsl/torus.vs";
import fragShader from "../glsl/torus.fs";
import Entity from "./Entity";

export default class Shape implements Entity {
	private _mesh: THREE.Mesh;
	private _timeU: THREE.IUniform;

	get mesh() { return this._mesh; }

	constructor() {
		const geom = new THREE.TorusBufferGeometry(5, 1, 32, 32);
		const mat = new THREE.RawShaderMaterial({
			uniforms: {
				time: { value: 0 },
			},
			side: THREE.FrontSide,
			vertexShader: vertShader,
			fragmentShader: fragShader,
		});
		this._timeU = mat.uniforms.time;
		this._mesh = new THREE.Mesh(geom, mat);
	}

	public update(secs: number): void {
		this._timeU.value = secs;
		this._mesh.rotation.set(
			Math.sin(secs / 10) * 2 * Math.PI,
			Math.cos(secs / 10) * 2 * Math.PI,
			0,
		);
	}
}
