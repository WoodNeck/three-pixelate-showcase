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

	constructor() {
		const canvasBox = document.getElementById("webgl-canvas") as HTMLCanvasElement;

		this._renderer = new Renderer(canvasBox);
		this._geoScene = new GeometryScene();
		this._foreScene = new ForegroundScene();

		this._onResize();

		this._constructScene();

		window.addEventListener("resize", this._onResize);
		requestAnimationFrame(this._render);
	}

	private _constructScene() {
		const geoScene = this._geoScene;
		const foreScene = this._foreScene;

		// Entities on geometry scene (before pixelating)
		const tile = new Tile(1, 0, 0);
		const tile2 = new Tile(2, -1, 0);
		const tile3 = new Tile(0, 1, 0);
		const tile4 = new Tile(-1, 2, 0);
		const tile5 = new Tile(3, -2, 0);
		const tile6 = new Tile(4, -3, 0);
		const tile7 = new Tile(-2, 3, 0);
		const tile8 = new Tile(-3, 4, 0);
		const tile9 = new Tile(5, -4, 0);
		const tile10 = new Tile(6, -5, 0);
		const tile11 = new Tile(-4, 5, 0);
		const tile12 = new Tile(-5, 6, 0);

		geoScene.add(tile);
		geoScene.add(tile2);
		geoScene.add(tile3);
		geoScene.add(tile4);
		geoScene.add(tile5);
		geoScene.add(tile6);
		geoScene.add(tile7);
		geoScene.add(tile8);
		geoScene.add(tile9);
		geoScene.add(tile10);
		geoScene.add(tile11);
		geoScene.add(tile12);

		// Entities on foreground scene (after pixelating)
		const plane = new TexturePlane(geoScene.renderTarget.texture);
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
		renderer.renderToTexture(geoScene, geoScene.renderTarget);
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
