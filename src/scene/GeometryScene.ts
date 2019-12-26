import * as THREE from "three";
import Scene from "./Scene";

export default class GeometryScene extends Scene {
	private _scene: THREE.Scene;
	private _camera: THREE.OrthographicCamera;
	private _renderTarget: THREE.WebGLRenderTarget;
	private _pixelPerUnit: number = 8;

	public get scene() { return this._scene; }
	public get camera() { return this._camera; }
	public get renderTarget() { return this._renderTarget; }
	public get pixelateScale() { return this._pixelPerUnit; }

	constructor() {
		super();

		this._scene = new THREE.Scene();
		this._scene.background = new THREE.TextureLoader().load("./textures/bgnd.png");

		this._camera = new THREE.OrthographicCamera(0, 0, 0, 0, 0);
		this._camera.rotateZ(-THREE.Math.DEG2RAD * 45);
		this._camera.rotateX(THREE.Math.DEG2RAD * 60);
		this._camera.position.z = 4;

		this._renderTarget = new THREE.WebGLRenderTarget(0, 0);
	}

	public resize(width: number, height: number) {
		const camera = this._camera;
		const pixelPerUnit = this._pixelPerUnit;
		const renderTarget = this._renderTarget;
		const pixelRatio = window.devicePixelRatio;
		const drawingW = width * pixelRatio;
		const drawingH = height * pixelRatio;
		const halfW = drawingW / pixelPerUnit * 0.5;
		const halfH = drawingH / pixelPerUnit * 0.5;

		// Camera specs, in abs unit
		// Left, right, top, bottom is in pixel unit
		// abs unit achieved by zoom
		camera.left = -halfW;
		camera.right = halfW;
		camera.top = halfH;
		camera.bottom = -halfH;

		camera.zoom = pixelPerUnit;

		// Render target, in abs unit
		renderTarget.setSize(
			drawingW / pixelPerUnit,
			drawingH / pixelPerUnit,
		);

		camera.updateProjectionMatrix();
	}

	public update(ms: number) {
		// this._camera.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -THREE.Math.DEG2RAD * 1);
	}
}
