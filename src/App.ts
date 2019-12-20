import * as THREE from "three";
import Renderer from "./Renderer";
import Tile from "./entity/Tile";
import TexturePlane from "./entity/TexturePlane";
import GeometryScene from "./scene/GeometryScene";
import ForegroundScene from "./scene/ForegroundScene";

class App {
	private _renderer: Renderer;
	private _geoScene: GeometryScene;
	private _foreScene: ForegroundScene;
	private _renderTarget: THREE.WebGLRenderTarget;
	private _pixelateScale: number = 8;

	constructor() {
		const canvasBox = document.getElementById("webgl-canvas") as HTMLCanvasElement;

		this._renderer = new Renderer(canvasBox);
		this._geoScene = new GeometryScene();
		this._foreScene = new ForegroundScene();

		this._onResize();

		const drawingSize = this._renderer.size;
		const pixelateScale = this._pixelateScale;
		this._renderTarget = new THREE.WebGLRenderTarget(
			drawingSize.x / pixelateScale, drawingSize.y / pixelateScale,
		);

		this._constructScene();

		window.addEventListener("resize", this._onResize);
		requestAnimationFrame(this._render);
	}

	private _constructScene() {
		const geoScene = this._geoScene;
		const foreScene = this._foreScene;

		// Entities on geometry scene (before pixelating)
		const tile = new Tile(1, 0, 0);
		const tile2 = new Tile(0, 1, 0);
		const tile3 = new Tile(1, 2, 0);
		const tile4 = new Tile(1, 1, 1);
		geoScene.add(tile);
		geoScene.add(tile2);
		geoScene.add(tile3);
		geoScene.add(tile4);

		// Entities on foreground scene (after pixelating)
		const plane = new TexturePlane(this._renderTarget.texture);
		foreScene.add(plane);
	}

	private _render = (t: number): void => {
		const renderer = this._renderer;
		const geoScene = this._geoScene;
		const foreScene = this._foreScene;

		// Update renderer & scenes
		geoScene.update(t);
		foreScene.update(t);
		renderer.update(t);

		// Render each scenes
		renderer.renderToTexture(geoScene, this._renderTarget);
		renderer.render(foreScene); // render target is binded to plnae in foreScene

		requestAnimationFrame(this._render);
	}

	private _onResize = () => {
		const width = window.innerWidth;
		const height = window.innerHeight;

		this._renderer.resize(width, height);
		this._geoScene.resize(width, height);
		this._foreScene.resize(width, height);
	}
}

// tslint:disable-next-line no-unused-expression
new App();
