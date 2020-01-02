import * as THREE from "three";
import Pass from "./Pass";
import EffectPlane from "../entity/EffectPlane";
import outlineVS from "../shader/outline.vs";
import outlineFS from "../shader/outline.fs";
import Layer from "src/layer/Layer";

export default class OutlinePass implements Pass {
	public readonly shouldSwap = true;

	private _effectPlane: EffectPlane;
	private _scene: THREE.Scene;
	private _camera: THREE.OrthographicCamera;

	constructor() {
		this._effectPlane = new EffectPlane({
			uTex: new THREE.Uniform(0),
			uDepthTex: new THREE.Uniform(0),
			uTexSize: new THREE.Vector2(1, 1),
		}, outlineVS, outlineFS);

		this._scene = new THREE.Scene();

		this._camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
		this._camera.position.z = 5;
		this._camera.updateProjectionMatrix();

		this._scene.add(this._effectPlane.mesh);
	}

	public render(renderer: THREE.WebGLRenderer, writeTarget: THREE.WebGLRenderTarget, readTarget: THREE.WebGLRenderTarget) {
		const uniforms = this._effectPlane.material.uniforms;
		uniforms.uTex.value = readTarget.texture;
		uniforms.uDepthTex.value = readTarget.depthTexture;
		uniforms.uTexSize.value = new THREE.Vector2(readTarget.width, readTarget.height);

		renderer.setRenderTarget(writeTarget);
		renderer.render(this._scene, this._camera);
		renderer.setRenderTarget(null);
	}

	public update(ms: number) {}
}
