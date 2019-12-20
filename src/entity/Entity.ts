import * as THREE from "three";
import Updateable from "src/interfaces/Updateable";

export default interface Entity extends Updateable {
	readonly mesh: THREE.Mesh;
}
