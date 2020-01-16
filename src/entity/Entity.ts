import * as THREE from "three";

import { Updateable } from "@/type";

export default interface Entity extends Updateable {
	readonly mesh: THREE.Mesh;
}
