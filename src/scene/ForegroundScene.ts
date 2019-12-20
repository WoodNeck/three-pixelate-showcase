import * as THREE from "three";
import Scene from "./Scene";

export default class ForegroundScene extends Scene {
	private _scene: THREE.Scene;
	private _camera: THREE.OrthographicCamera;

	public get scene() { return this._scene; }
	public get camera() { return this._camera; }

	constructor() {
		super();

		this._scene = new THREE.Scene();

		this._camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
		this._camera.position.z = 5;
		this._camera.updateProjectionMatrix();
	}

	public resize(width: number, height: number) {}
}
