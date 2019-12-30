import * as THREE from "three";
import Entity from "./Entity";
import vertexShader from "../shader/pixelate.vs";
import fragmentShader from "../shader/pixelate.fs";

export default class TexturePlane implements Entity {
	private _material: THREE.RawShaderMaterial;
	private _mesh: THREE.Mesh;

	public get mesh() { return this._mesh; }

	constructor(texture: THREE.Texture) {
		const material = new THREE.RawShaderMaterial({
			uniforms: {
				uTex: new THREE.Uniform(texture),
				uThreshold: new Float32Array([
					1. / 16., 9. / 16., 3. / 16., 11. / 16.,
					13. / 16., 5. / 16., 15. / 16., 7. / 16.,
					4. / 16., 12. / 16., 2. / 16., 10. / 16.,
					16. / 16., 8. / 16., 14. / 16., 6. / 16.,
				]),
			},
			vertexShader,
			fragmentShader,
		});
		const geometry = new THREE.PlaneGeometry(1, 1);

		this._mesh = new THREE.Mesh(geometry, material);
		this._material = material;
	}

	public update(ms: number) {
		this._material.needsUpdate = true;
	}
}
