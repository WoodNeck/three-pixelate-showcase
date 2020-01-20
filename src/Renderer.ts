import * as THREE from "three";
import { Updateable } from "./type/common";
import Pass from "./pass/Pass";
import { WebGLRenderTargetOptions } from "three";

export default class Renderer implements Updateable {
	private _renderer: THREE.WebGLRenderer;
	private _passes: Pass[];
	private _writeTarget: THREE.WebGLRenderTarget;
	private _readTarget: THREE.WebGLRenderTarget;

	public get size() { return this._renderer.getDrawingBufferSize(new THREE.Vector2(0, 0)); }

	constructor(canvasElem: HTMLCanvasElement) {
		const ctx = canvasElem.getContext("webgl2");

		this._renderer = new THREE.WebGLRenderer({
			canvas: canvasElem,
			antialias: true,
			context: ctx as WebGLRenderingContext,
		});

		this._passes = [];

		const width = window.innerWidth;
		const height = window.innerHeight;
		const rtOptions: WebGLRenderTargetOptions = {
			magFilter: THREE.NearestFilter,
			minFilter: THREE.NearestFilter,
			generateMipmaps: false,
			depthBuffer: true,
		};
		this._writeTarget = new THREE.WebGLRenderTarget(width, height, rtOptions);
		this._readTarget = new THREE.WebGLRenderTarget(width, height, rtOptions);
		this._writeTarget.depthTexture = new THREE.DepthTexture(width, height, THREE.UnsignedShortType);
		this._readTarget.depthTexture = new THREE.DepthTexture(width, height, THREE.UnsignedShortType);
	}

	public resize(width: number, height: number): void {
		const renderer = this._renderer;

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width, height);
	}

	public addPass(pass: Pass) {
		this._passes.push(pass);
	}

	public render() {
		for (const pass of this._passes) {
			pass.render(this._renderer, this._writeTarget, this._readTarget);
			if (pass.shouldSwap) {
				this._swapTargets();
			}
		}
	}

	public update(ms: number) {}

	public setRenderTargetSize(width: number, height: number) {
		this._readTarget.setSize(width, height);
		this._writeTarget.setSize(width, height);
	}

	private _swapTargets() {
		const temp = this._writeTarget;
		this._writeTarget = this._readTarget;
		this._readTarget = temp;
	}
}
