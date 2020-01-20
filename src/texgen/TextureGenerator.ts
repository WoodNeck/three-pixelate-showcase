import { TexturePack } from "@/type/common";
import { DIRECTION } from "@/const/common";

export default interface TextureGenerator {
	prepare(x: number, y: number, z: number): void;
	generate(side: DIRECTION): TexturePack;
}
