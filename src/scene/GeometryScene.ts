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

		this._camera = new THREE.OrthographicCamera(0, 0, 0, 0, -100);
		this._camera.rotateZ(-THREE.Math.DEG2RAD * 45);
		this._camera.rotateX(THREE.Math.DEG2RAD * 60);
		// Give bias to make tile looks more pixel-art style
		this._camera.position.z = 0.1;
		this._camera.translateX(0);

		this._renderTarget = new THREE.WebGLRenderTarget(0, 0);
	}

	public resize(width: number, height: number) {
		const camera = this._camera;
		const pixelPerUnit = this._pixelPerUnit;
		const renderTarget = this._renderTarget;
		const pixelRatio = window.devicePixelRatio;
		const drawingW = width * pixelRatio;
		const drawingH = height * pixelRatio;

		// Width, Height of the render target
		let rtW = Math.floor(drawingW / pixelPerUnit);
		let rtH = Math.floor(drawingH / pixelPerUnit);
		// Make sure they are multiple of 2
		rtW -= rtW % 2;
		rtH -= rtH % 2;

		const halfW = rtW / 2;
		const halfH = rtH / 2;

		// Camera specs, in abs unit
		// Left, right, top, bottom is in pixel unit
		// abs unit achieved by zoom value
		camera.left = -halfW;
		camera.right = halfW;
		camera.top = halfH;
		camera.bottom = -halfH;

		camera.zoom = pixelPerUnit;

		// Render target, in abs unit
		renderTarget.setSize(rtW, rtH);

		camera.updateProjectionMatrix();
	}

	public update(ms: number) {
		// this._camera.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -THREE.Math.DEG2RAD * 1);
	}
}
