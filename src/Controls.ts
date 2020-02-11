import * as THREE from "three";
import Axes, { PanInput, MoveKeyInput } from "@egjs/axes";
import { Vector3 } from "three";

export default class Controls {
	private _camera: THREE.Camera;
	private _axes: Axes;
	private _animating: boolean;
	private _lookAtPos: THREE.Vector3;

	constructor(camera: THREE.Camera) {
		this._camera = camera;
		this._axes = new Axes({
			yaw: { range: [0, 360], circular: [true, true] },
			x: { range: [-100, 100], circular: [true, true] },
			y: { range: [-100, 100], circular: [true, true] },
		}, {
			interruptable: false,
			deceleration: 0.0024,
		});
		this._animating = false;
		this._lookAtPos = new Vector3(0, 0, 0);

		const panInput = new PanInput(document.documentElement, {
			scale: [0.10],
		});
		const moveKeyInput = new MoveKeyInput(document.documentElement);
		this._axes.connect("yaw", panInput);
		this._axes.connect(["x", "y"], moveKeyInput);

		this._setupAxesHandler();
		this._setupKeys();
	}

	private _setupAxesHandler() {
		this._axes.on("animationStart", () => {
			this._animating = true;
		});
		this._axes.on("change", e => {
			const delta = e.delta;
			const camera = this._camera;

			camera.translateX(delta.x);
			camera.translateY(delta.y);

			if (delta.yaw !== 0) {
				camera.rotateOnWorldAxis(
					new THREE.Vector3(0, 0, 1),
					(delta.yaw * Math.PI) / 180,
				);
			}
		});
		this._axes.on("animationEnd", () => {
			this._animating = false;
		});
	}

	private _setPosition() {
		const camera = this._camera;
		const yaw = this._axes.get().yaw;

		const newPos = new THREE.Vector3(0, 0, 10);

		camera.lookAt(this._lookAtPos);
	}

	private _setupKeys() {
		window.addEventListener("keydown", e => {
			if (this._animating) return;
			if (e.keyCode === 81) {
				// Q
				const prevYaw = this._axes.get().yaw;
				this._axes.setTo({yaw: prevYaw - 90}, 1000);
			} else if (e.keyCode === 69) {
				// E
				const prevYaw = this._axes.get().yaw;
				this._axes.setTo({yaw: prevYaw + 90}, 1000);
			}
		});
	}
}
