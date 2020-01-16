import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Layer from "./Layer";
import Map from "../map/Map";
import cellVS from "../shader/cell.vs";
import cellFS from "../shader/cell.fs";

export default class PixelatedLayer extends Layer {
	private _scene: THREE.Scene;
	private _camera: THREE.OrthographicCamera;
	private _map: Map;
	private _sun: THREE.DirectionalLight;
	private _pixelPerUnit: number = 8;

	public get scene() { return this._scene; }
	public get camera() { return this._camera; }
	public get pixelPerUnit() { return this._pixelPerUnit; }

	constructor() {
		super();

		this._scene = new THREE.Scene();
		this._scene.background = new THREE.Color("#1a1c2c");

		this._camera = new THREE.OrthographicCamera(0, 0, 0, 0, -120, 120);
		this._camera.rotateZ(-THREE.Math.DEG2RAD * 45);
		this._camera.rotateX(THREE.Math.DEG2RAD * 60);

		// const viewDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this._camera.quaternion);
		// this._camera.position.add(viewDir.multiplyScalar(-30));

		this._map = new Map();

		this._sun = new THREE.DirectionalLight(new THREE.Color("#fff"), 2);

		this._sun.position.set(3, 0, 3);
		this._sun.lookAt(0, 0, 0);

		this._scene.add(new THREE.AmbientLight("#fff", 1));

		this._scene.add(this._sun);

		this._constructScene();
	}

	public update(ms: number) {
		const theta = -THREE.Math.DEG2RAD * ms / 50;
		this._sun.position.set(3 * Math.cos(theta), 3 * Math.sin(theta), 3);
		this._sun.lookAt(0, 0, 0);
		// this._camera.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -THREE.Math.DEG2RAD * 0.4);
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
		// Make sure they are even
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
		this._map.tiles.forEach(tiles => {
			tiles.forEach(tile => this.add(tile));
		});

		// const geometry = new THREE.TorusKnotGeometry(3);
		// const material = new THREE.RawShaderMaterial({
		// 	vertexShader: cellVS,
		// 	fragmentShader: cellFS,
		// });
		// const mesh = new THREE.Mesh(geometry, material);
		// mesh.translateY(-10);
		// mesh.rotateZ(5);
		// this._scene.add(mesh);

		// const loader = new GLTFLoader();

		// loader.load("./pidgeon.gltf", gltf => {
		// 	gltf.scene.rotateX(Math.PI / 2);
		// 	this._scene.add( gltf.scene );
		// }, undefined, error => {
		// 	console.error( error );
		// } );
	}
}
