import * as THREE from "three";
import Scene from "./Scene";

export default class GeometryScene extends Scene {
	private _scene: THREE.Scene;
	private _camera: THREE.OrthographicCamera;
	private _zoom: number;

	public get scene() { return this._scene; }
	public get camera() { return this._camera; }

	public set zoom(val: number) { this._zoom = val; }

	constructor() {
		super();

		this._zoom = 80;

		this._scene = new THREE.Scene();
		this._scene.background = new THREE.TextureLoader().load("./textures/bgnd.png");

		this._camera = new THREE.OrthographicCamera(0, 0, 0, 0);
		this._camera.position.z = 15;
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
}
