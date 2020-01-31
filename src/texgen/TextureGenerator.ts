import { TexturePack } from "@/type/common";
import { DIRECTION } from "@/const/common";

export default interface TextureGenerator {
	prepare(x: number, y: number, z: number, hasSameTypeOnTop: boolean): void;
	generate(x: number, y: number, z: number, side: DIRECTION): TexturePack;
}
