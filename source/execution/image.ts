import { ImageAnnotations } from "./metadata";

export class AnnotatedImage {
	public image: Buffer;
	public annotations: ImageAnnotations;
}