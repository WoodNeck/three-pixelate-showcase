import * as THREE from "three";
import Layer from "./Layer";
import EffectPlane from "../entity/EffectPlane";
import ditherVS from "../shader/dither.vs";
import ditherFS from "../shader/dither.fs";

export default class ForegroundLayer extends Layer {
	private _scene: THREE.Scene;
	private _camera: THREE.OrthographicCamera;
	private _effectPlane: EffectPlane;

	public get scene() { return this._scene; }
	public get camera() { return this._camera; }

	constructor() {
		super();

		this._scene = new THREE.Scene();

		this._camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
		this._camera.position.z = 5;
		this._camera.updateProjectionMatrix();

		this._effectPlane = new EffectPlane({uTex: new THREE.Uniform(0)}, ditherVS, ditherFS);
		this._scene.add(this._effectPlane.mesh);
	}

	public resize(width: number, height: number) {}

	public updateScene(readTarget: THREE.WebGLRenderTarget) {
		const uniforms = this._effectPlane.material.uniforms;
		uniforms.uTex.value = readTarget.texture;
	}
}
