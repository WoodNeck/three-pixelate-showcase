import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Layer from "./Layer";
import Tile from "../entity/Tile";

export default class PixelatedLayer extends Layer {
	private _scene: THREE.Scene;
	private _camera: THREE.OrthographicCamera;
	private _pixelPerUnit: number = 8;

	public get scene() { return this._scene; }
	public get camera() { return this._camera; }
	public get pixelPerUnit() { return this._pixelPerUnit; }

	constructor() {
		super();

		this._scene = new THREE.Scene();
		this._scene.background = new THREE.TextureLoader().load("./textures/bgnd.png");

		this._camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
		this._camera.rotateZ(-THREE.Math.DEG2RAD * 45);
		this._camera.rotateX(THREE.Math.DEG2RAD * 60);
		this._camera.translateX(0);

		const light = new THREE.DirectionalLight(new THREE.Color("#fff"));

		light.position.set( 0, 0, 1 );
		light.lookAt(0, 0, 0);

		this._scene.add(light);

		this._constructScene();
	}

	public update(ms: number) {
		// this._camera.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -THREE.Math.DEG2RAD * 1);
	}

	public updateScene(readTarget: THREE.WebGLRenderTarget) {}

	public resize(width: number, height: number) {
		const camera = this._camera;
		const pixelPerUnit = this._pixelPerUnit;
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

		camera.updateProjectionMatrix();
	}

	private _constructScene() {
		const tile = new Tile(0, 0, 0);
		const tile2 = new Tile(1, 0, 0);
		const tile3 = new Tile(2, -2, 0);
		const tile4 = new Tile(3, -1, 0);
		const tile5 = new Tile(3, -2, 0);
		const tile6 = new Tile(4, -3, 0);
		const tile7 = new Tile(4, -2, 1);
		const tile8 = new Tile(-3, 4, 0);
		const tile9 = new Tile(3, -3, 1);
		const tile10 = new Tile(6, -5, 0);
		const tile11 = new Tile(-4, 5, 0);
		const tile12 = new Tile(-5, 6, 0);

		this.add(tile);
		this.add(tile2);
		this.add(tile3);
		this.add(tile4);
		this.add(tile5);
		this.add(tile6);
		this.add(tile7);
		this.add(tile8);
		this.add(tile9);
		this.add(tile10);
		this.add(tile11);
		this.add(tile12);

		const loader = new GLTFLoader();

		loader.load("./pidgeon.gltf", gltf => {
			gltf.scene.rotateX(Math.PI / 2);
			this._scene.add( gltf.scene );
		}, undefined, error => {
			console.error( error );
		} );
	}
}
