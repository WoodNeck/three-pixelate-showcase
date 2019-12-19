import * as THREE from "three";

export default interface Entity {
	readonly mesh: THREE.Mesh;
	update(time: number): void;
}
