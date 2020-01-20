import * as THREE from "three";

import { Updateable } from "@/type/common";

export default interface Entity extends Updateable {
	readonly mesh: THREE.Mesh;
}
