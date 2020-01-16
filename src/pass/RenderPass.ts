import * as THREE from "three";

import Pass from "./Pass";
import Layer from "@/layer/Layer";

export default class RenderPass implements Pass {
	private _layer: Layer;
	private _renderToTexture: boolean;
	private _shouldSwap: boolean;

	public get shouldSwap() { return this._shouldSwap; }

	public set renderToTexture(val: boolean) {
		this._renderToTexture = val;
		this._shouldSwap = val;
	}

	constructor(layer: Layer) {
		this._layer = layer;
		this._renderToTexture = false;
		this._shouldSwap = false;
	}

	public render(renderer: THREE.WebGLRenderer, writeTarget: THREE.WebGLRenderTarget, readTarget: THREE.WebGLRenderTarget) {
		const layer = this._layer;

		layer.updateScene(readTarget);

		if (this._renderToTexture) {
			renderer.setRenderTarget(writeTarget);
			renderer.render(layer.scene, layer.camera);
			renderer.setRenderTarget(null);
		} else {
			renderer.render(layer.scene, layer.camera);
		}
	}

	public update(ms: number) {}
}
