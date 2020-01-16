import * as THREE from "three";
import Axes, { PanInput, MoveKeyInput } from "@egjs/axes";

export default class Controls {
	private _camera: THREE.Camera;
	private _axes: Axes;

	constructor(camera: THREE.Camera) {
		this._camera = camera;
		this._axes = new Axes({
			yaw: { range: [0, 360], circular: [true, true] },
			x: { range: [-100, 100], circular: [true, true] },
			y: { range: [-100, 100], circular: [true, true] },
		}, {
			deceleration: 0.0024,
		});

		const panInput = new PanInput(document.documentElement, {
			scale: [0.10],
		});
		const moveKeyInput = new MoveKeyInput(document.documentElement);
		this._axes.connect("yaw", panInput);
		this._axes.connect(["x", "y"], moveKeyInput);

		this._setupAxesHandler();
	}

	private _setupAxesHandler() {
		this._axes.on("change", e => {
			const delta = e.delta;
			const camera = this._camera;

			camera.translateX(delta.x);
			camera.translateY(delta.y);

			if (delta.yaw !== 0) {
				camera.rotateOnWorldAxis(
					new THREE.Vector3(0, 0, 1).normalize(),
					(delta.yaw * Math.PI) / 180,
				);
			}
		});
	}
}
