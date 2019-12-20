import Entity from "./entity/Entity";

export default class EntityManager {
	private _entities: Map<string, Entity>;

	public get values() { return this._entities.values(); }

	constructor() {
		this._entities = new Map();
	}

	public add(entity: Entity) {
		this._entities.set(entity.mesh.uuid, entity);
	}

	public remove(entity: Entity) {
		this._entities.delete(entity.mesh.uuid);
	}
}
