import { Image, ImageAnnotations } from "./image";

export class Step {
	public guide?: string[];
	public screenshots?: Image[];
}

export class StepAnnotations {
	public guide?: string[];
	public screenshots?: ImageAnnotations[];
}