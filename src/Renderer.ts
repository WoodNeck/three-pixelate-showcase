import * as THREE from "three";
import Resizeable from "./interfaces/Resizable";
import Updateable from "./interfaces/Updateable";
import Scene from "./scene/Scene";

export default class Renderer implements Resizeable, Updateable {
	private _renderer: THREE.WebGLRenderer;

	public get size() { return this._renderer.getDrawingBufferSize(new THREE.Vector2(0, 0)); }

	constructor(canvasElem: HTMLCanvasElement) {
		this._renderer = new THREE.WebGLRenderer({
			canvas: canvasElem,
			antialias: true,
		});
	}

	public resize(width: number, height: number): void {
		const renderer = this._renderer;

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width, height);
	}

	public render(renderScene: Scene): void {
		const renderer = this._renderer;

		renderer.render(renderScene.scene, renderScene.camera);
	}

	public renderToTexture(renderScene: Scene, renderTarget: THREE.RenderTarget) {
		const renderer = this._renderer;

		renderer.setRenderTarget(renderTarget);
		this.render(renderScene);
		renderer.setRenderTarget(null);
	}

	public update(ms: number) {}
}
