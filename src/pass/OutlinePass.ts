import * as THREE from "three";
import Pass from "./Pass";
import EffectPlane from "../entity/EffectPlane";
import outlineVS from "../shader/outline.vs";
import outlineFS from "../shader/outline.fs";
import Layer from "src/layer/Layer";

export default class OutlinePass implements Pass {
	public readonly shouldSwap = true;

	private _layer: Layer;
	private _effectPlane: EffectPlane;
	private _depthTarget: THREE.WebGLRenderTarget;
	private _scene: THREE.Scene;
	private _camera: THREE.OrthographicCamera;

	constructor(layer: Layer) {
		this._layer = layer;

		this._depthTarget = new THREE.WebGLRenderTarget(0, 0, {
			magFilter: THREE.NearestFilter,
			minFilter: THREE.NearestFilter,
			generateMipmaps: false,
			depthBuffer: true,
		});
		this._depthTarget.depthTexture = new THREE.DepthTexture(0, 0, THREE.UnsignedShortType);

		this._effectPlane = new EffectPlane({
			uTex: new THREE.Uniform(0),
			uDepthTex: new THREE.Uniform(0),
			uOutlineTex: this._depthTarget.depthTexture,
		}, outlineVS, outlineFS);

		this._scene = new THREE.Scene();

		this._camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
		this._camera.position.z = 5;
		this._camera.updateProjectionMatrix();

		this._scene.add(this._effectPlane.mesh);
	}

	public render(renderer: THREE.WebGLRenderer, writeTarget: THREE.WebGLRenderTarget, readTarget: THREE.WebGLRenderTarget) {
		const layer = this._layer;
		const depthTarget = this._depthTarget;

		if (readTarget.width !== depthTarget.width || readTarget.height !== depthTarget.height) {
			depthTarget.setSize(readTarget.width, readTarget.height);
		}

		const cameraOffset = -0.15;

		renderer.setRenderTarget(depthTarget);
		layer.camera.translateY(cameraOffset);
		renderer.render(layer.scene, layer.camera);
		layer.camera.translateY(-cameraOffset);
		renderer.setRenderTarget(null);

		const uniforms = this._effectPlane.material.uniforms;
		uniforms.uTex.value = readTarget.texture;
		uniforms.uDepthTex.value = readTarget.depthTexture;
		uniforms.uOutlineTex.value = depthTarget.depthTexture;

		renderer.setRenderTarget(writeTarget);
		renderer.render(this._scene, this._camera);
		renderer.setRenderTarget(null);
	}

	public update(ms: number) {}
}
