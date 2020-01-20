import * as THREE from "three";

import { Updateable } from "@/type/common";

export default interface Pass extends Updateable {
	readonly shouldSwap: boolean;
	render(renderer: THREE.WebGLRenderer, writeTarget: THREE.RenderTarget, readTarget: THREE.RenderTarget): void;
}
