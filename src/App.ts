import Renderer from "./Renderer";
import PixelatedLayer from "./layer/PixelatedLayer";
import ForegroundLayer from "./layer/ForegroundLayer";
import OutlinePass from "./pass/OutlinePass";
import RenderPass from "./pass/RenderPass";

class App {
	private _renderer: Renderer;
	private _pixelLayer: PixelatedLayer;
	private _foreLayer: ForegroundLayer;

	constructor() {
		const canvasBox = document.getElementById("webgl-canvas") as HTMLCanvasElement;

		this._renderer = new Renderer(canvasBox);

		this._pixelLayer = new PixelatedLayer();
		this._foreLayer = new ForegroundLayer();
		this._composePass();
		this._onResize();

		window.addEventListener("resize", this._onResize);
		requestAnimationFrame(this._render);
	}

	private _composePass() {
		const renderer = this._renderer;
		const pixelLayer = this._pixelLayer;
		const foreLayer = this._foreLayer;

		const pixelatePass = new RenderPass(pixelLayer);
		pixelatePass.renderToTexture = true;

		const outlinePass = new OutlinePass();
		const renderPass = new RenderPass(foreLayer);

		renderer.addPass(pixelatePass);
		renderer.addPass(outlinePass);
		renderer.addPass(renderPass);
	}

	private _render = (t: number): void => {
		const renderer = this._renderer;
		const pixelLayer = this._pixelLayer;
		const foreLayer = this._foreLayer;

		// Update renderer & scenes
		pixelLayer.update(t);
		foreLayer.update(t);
		renderer.update(t);

		// Render each scenes
		renderer.render();

		requestAnimationFrame(this._render);
	}

	private _onResize = () => {
		const width = window.innerWidth;
		const height = window.innerHeight;

		this._renderer.resize(width, height);
		this._pixelLayer.resize(width, height);
		this._foreLayer.resize(width, height);

		const pixelCamera = this._pixelLayer.camera;
		this._renderer.setRenderTargetSize(
			pixelCamera.right - pixelCamera.left,
			pixelCamera.top - pixelCamera.bottom,
		);
	}
}

// tslint:disable-next-line no-unused-expression
new App();
