import * as THREE from "three";
import Scene from "./Scene";

export default class GeometryScene extends Scene {
	private _scene: THREE.Scene;
	private _camera: THREE.OrthographicCamera;
	private _zoom: number = 64;

	public get scene() { return this._scene; }
	public get camera() { return this._camera; }

	public set zoom(val: number) { this._zoom = val; }

	constructor() {
		super();

		this._scene = new THREE.Scene();
		this._scene.background = new THREE.TextureLoader().load("./textures/bgnd.png");

		this._camera = new THREE.OrthographicCamera(0, 0, 0, 0, 0);
		this._camera.rotateZ(-THREE.Math.DEG2RAD * 45);
		this._camera.rotateX(THREE.Math.DEG2RAD * 60);
	}

	public resize(width: number, height: number) {
		const camera = this._camera;
		const zoom = this._zoom;

		camera.left = -width / zoom;
		camera.right = width / zoom;
		camera.top = height / zoom;
		camera.bottom = -height / zoom;

		camera.updateProjectionMatrix();
	}

	public update(ms: number) {
		this._camera.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -THREE.Math.DEG2RAD * 1);
	}
}
