import * as THREE from "three";

import Pass from "./Pass";
import EffectPlane from "@/entity/EffectPlane";
import outlineVS from "@/shader/outline.vs";
import outlineFS from "@/shader/outline.fs";
import PaletteTexture from "@/palette/PaletteTexture";
import * as COLORS from "@/palette/colors";

export default class OutlinePass implements Pass {
	public readonly shouldSwap = true;

	private _effectPlane: EffectPlane;
	private _scene: THREE.Scene;
	private _camera: THREE.OrthographicCamera;

	constructor() {
		this._scene = new THREE.Scene();

		this._camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
		this._camera.position.z = 5;
		this._camera.updateProjectionMatrix();

		this._effectPlane = new EffectPlane({
			uTex: new THREE.Uniform(0),
			uDepthTex: new THREE.Uniform(0),
			uPaletteTex: new THREE.Uniform(0),
			uInvTexSize: new THREE.Vector2(1, 1),
		}, outlineVS, outlineFS);

		this._scene.add(this._effectPlane.mesh);

		// Load palette texture
		const uniforms = this._effectPlane.material.uniforms;

		uniforms.uPaletteTex.value = PaletteTexture.get(COLORS.ICE_CREAM_GB);
	}

	public render(renderer: THREE.WebGLRenderer, writeTarget: THREE.WebGLRenderTarget, readTarget: THREE.WebGLRenderTarget) {
		const uniforms = this._effectPlane.material.uniforms;
		uniforms.uTex.value = readTarget.texture;
		uniforms.uDepthTex.value = readTarget.depthTexture;
		uniforms.uInvTexSize.value = new THREE.Vector2(1 / readTarget.width, 1 / readTarget.height);

		renderer.setRenderTarget(writeTarget);
		renderer.render(this._scene, this._camera);
		renderer.setRenderTarget(null);
	}

	public update(ms: number) {}
}
