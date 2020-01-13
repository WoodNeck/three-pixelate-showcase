import * as THREE from "three";
import { range } from "../util";

interface PlaneData {
	indices: number[];
	vertices: number[];
	normals: number[];
	uvs: number[];
}
type PlaneProp = [string, string, string, number, number, number, number, number, number, number, number];

/**
 * TileGeometry, which made with purpose to map different uv for vertices from BoxGeometry
 * Most of the code is imported from Three.js's code of BoxBufferGeometry
 */
export default class TileGeometry extends THREE.BufferGeometry {
	//      🡑 +z
	// +y 🡔 □ 🡕 +x
	constructor(
		width: number = 1, height: number = 1, depth: number = 1,
		widthSegments: number = 1, heightSegments: number = 1, depthSegments: number = 1,
	) {
		super();

		this.type = "TileGeometry";

		const w = width;
		const h = height;
		const d = depth;

		// segments
		const wS = Math.floor(widthSegments);
		const hS = Math.floor(heightSegments);
		const dS = Math.floor(depthSegments);

		// helper variables
		let numberOfVertices = 0;
		let groupStart = 0;

		// build each side of the box geometry
		const planeProps: PlaneProp[] = [
			["z", "y", "x", -1, -1, d, h,  w, dS, hS, 0], // px
			["z", "y", "x",  1, -1, d, h, -w, dS, hS, 1], // nx
			["x", "z", "y",  1,  1, w, d,  h, wS, dS, 2], // py
			["x", "z", "y",  1, -1, w, d, -h, wS, dS, 3], // ny
			["x", "y", "z",  1, -1, w, h,  d, wS, hS, 4], // pz
			["x", "y", "z", -1, -1, w, h, -d, wS, hS, 5], // nz
		];

		const buildPlane = this._buildPlane.bind(this) as any; // I don't like this either

		const planes = planeProps.reduce((total: PlaneData[], planeProp): PlaneData[] => {
			const plane = buildPlane(...planeProp, numberOfVertices, groupStart) as PlaneData;
			numberOfVertices += (planeProp[8] + 1) * (planeProp[9] + 1);
			groupStart += 6 * planeProp[8] * planeProp[9];
			return [...total, plane];
		}, [] as PlaneData[]);
		const indices = planes.reduce((total: number[], plane): number[] => [...total, ...plane.indices], []);
		const vertices = planes.reduce((total: number[], plane): number[] => [...total, ...plane.vertices], []);
		const normals = planes.reduce((total: number[], plane): number[] => [...total, ...plane.normals], []);
		const uvs = planes.reduce((total: number[], plane): number[] => [...total, ...plane.uvs], []);

		// build geometry
		this.setIndex(indices);
		this.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
		this.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
		this.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
	}

	private _buildPlane(
		u: string, v: string, w: string, udir: number, vdir: number,
		width: number, height: number, depth: number, gridX: number, gridY: number, materialIndex: number,
		numberOfVertices: number, groupStart: number,
	): PlaneData {
		const segmentWidth = width / gridX;
		const segmentHeight = height / gridY;

		const widthHalf = width / 2;
		const heightHalf = height / 2;
		const depthHalf = depth / 2;

		const gridX1 = gridX + 1;
		const gridY1 = gridY + 1;

		let groupCount = 0;

		const vector = new THREE.Vector3();
		const indices: number[] = [];
		const vertices: number[] = [];
		const normals: number[] = [];
		const uvs: number[] = [];

		// generate vertices, normals and uvs
		for (const iy of range(gridY1)) {
			const y = iy * segmentHeight - heightHalf;

			for (const ix of range(gridX1)) {
				const x = ix * segmentWidth - widthHalf;

				// set values to correct vector component
				vector[u] = x * udir;
				vector[v] = y * vdir;
				vector[w] = depthHalf;

				// now apply vector to vertex buffer
				vertices.push(vector.x, vector.y, vector.z);

				// set values to correct vector component
				vector[u] = 0;
				vector[v] = 0;
				vector[w] = depth > 0 ? 1 : - 1;

				// now apply vector to normal buffer
				normals.push(vector.x, vector.y, vector.z);

				// uvs
				switch (materialIndex) {
					case 0:
						// px
						uvs.push(1 - iy / gridY);
						uvs.push(1 - ix / gridX);
						break;
					case 1:
						// nx
						uvs.push(iy / gridY);
						uvs.push(ix / gridX);
						break;
					case 2:
						// py
						uvs.push(1 - ix / gridX);
						uvs.push(iy / gridY);
						break;
					case 3:
						// ny
						uvs.push(ix / gridX);
						uvs.push(1 - iy / gridY);
						break;
					case 4:
					case 5:
					case 6:
						uvs.push(ix / gridX);
						uvs.push(1 - iy / gridY);
						break;
				}
			}
		}

		// indices

		// 1. you need three indices to draw a single face
		// 2. a single segment consists of two faces
		// 3. so we need to generate six (2*3) indices per segment
		for (const iy of range(gridY)) {
			for (const ix of range(gridX)) {
				const a = numberOfVertices + ix + gridX1 * iy;
				const b = numberOfVertices + ix + gridX1 * (iy + 1);
				const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
				const d = numberOfVertices + (ix + 1) + gridX1 * iy;

				// faces
				indices.push(a, b, d);
				indices.push(b, c, d);

				// increase counter
				groupCount += 6;
			}
		}

		// add a group to the geometry. this will ensure multi material support
		this.addGroup(groupStart, groupCount, materialIndex);

		return {
			indices,
			vertices,
			normals,
			uvs,
		};
	}
}
