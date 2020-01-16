import * as THREE from "three";

import EntityManager from "@/EntityManager";
import Entity from "@/entity/Entity";
import { Updateable } from "@/type";

export default abstract class Layer implements Updateable {
	public abstract get scene(): Readonly<THREE.Scene>;
	public abstract get camera(): Readonly<THREE.OrthographicCamera>;

	protected _entityMananger: EntityManager;

	constructor() {
		this._entityMananger = new EntityManager();
	}

	public add(entity: Entity) {
		this.scene.add(entity.mesh);
		this._entityMananger.add(entity);
	}

	public remove(entity: Entity) {
		this.scene.remove(entity.mesh);
		this._entityMananger.remove(entity);
	}

	public update(ms: number): void {
		for (const entity of this._entityMananger.values) {
			entity.update(ms);
		}
	}

	public abstract resize(width: number, height: number): void;
	public abstract updateScene(readTarget: THREE.WebGLRenderTarget): void;
}
