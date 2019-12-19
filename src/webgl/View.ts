import * as THREE from "three";
import Entity from "./entity/Entity";

import vertShader from "./glsl/torus.vs";
import fragShader from "./glsl/torus.fs";

export default class View {
	private renderer: THREE.WebGLRenderer;
	private rtScene: THREE.Scene;
	private rtCamera: THREE.OrthographicCamera;
	private scene: THREE.Scene;
	private camera: THREE.OrthographicCamera;
	private renderTarget: THREE.WebGLRenderTarget;
	private zoomFactor: number = 80;

	constructor(canvasElem: HTMLCanvasElement) {
		this.renderer = new THREE.WebGLRenderer({
			canvas: canvasElem,
			antialias: true,
		});

		this.rtCamera = new THREE.OrthographicCamera(0, 0, 0, 0);
		this.rtCamera.position.z = 15;

		// Set initial sizes for renderer & camera
		this.onWindowResize();

		this.renderer = new THREE.WebGLRenderer({
			canvas: canvasElem,
			antialias: true,
		});

		this.rtScene = new THREE.Scene();
		this.rtScene.background = new THREE.TextureLoader().load("./textures/bgnd.png");

		this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
		this.camera.position.z = 5;
		this.camera.updateProjectionMatrix();
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color("#666");

		// 2-pass rendering setup
		const drawingSize = this.renderer.getDrawingBufferSize(new THREE.Vector2(0, 0));
		const pixelateScale = 10;
		this.renderTarget = new THREE.WebGLRenderTarget(
			drawingSize.x / pixelateScale, drawingSize.y / pixelateScale,
		);

		const material = new THREE.MeshPhongMaterial({
			map: this.renderTarget.texture,
		});
		const geometry = new THREE.PlaneGeometry(1, 1);
		const plane = new THREE.Mesh(geometry, material);
		this.scene.add(plane);

		const color = 0xFFFFFF;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);

		light.position.set(-1, 2, 4);
		this.scene.add(light);

		window.addEventListener("resize", this.onWindowResize);
	}

	public onWindowResize = (): void => {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const zoom = this.zoomFactor;

		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(width, height);

		this.rtCamera.left = -width / zoom;
		this.rtCamera.right = width / zoom;
		this.rtCamera.top = height / zoom;
		this.rtCamera.bottom = -height / zoom;
		this.rtCamera.updateProjectionMatrix();
	}

	public add(entity: Entity) {
		this.rtScene.add(entity.mesh);
	}

	public remove(entity: Entity) {
		this.rtScene.remove(entity.mesh);
	}

	public update(): void {
		this.renderPixelatePass();
		this.renderForegroundPass();
	}

	public renderPixelatePass(): void {
		const renderer = this.renderer;
		const renderTarget = this.renderTarget;

		renderer.setRenderTarget(renderTarget);
		renderer.render(this.rtScene, this.rtCamera);
		renderer.setRenderTarget(null);
	}

	public renderForegroundPass(): void {
		this.renderer.render(this.scene, this.camera);
	}
}
