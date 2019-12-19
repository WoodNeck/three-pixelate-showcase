import View from "./webgl/View";
import Shape from "./webgl/entity/Shape";
import Entity from "./webgl/entity/Entity";

class App {
	private view: View;
	private entities: Entity[];

	constructor() {
		const canvasBox = document.getElementById("webgl-canvas") as HTMLCanvasElement;
		this.view = new View(canvasBox);

		const torus = new Shape();
		this.entities = [];
		this.entities.push(torus);

		this.view.add(torus);

		this.update(0);
	}

	private update = (t: number): void => {
		const time = t / 1000;

		this.entities.forEach(entity => entity.update(time));
		this.view.update();

		requestAnimationFrame(this.update);
	}
}

// tslint:disable-next-line no-unused-expression
new App();
