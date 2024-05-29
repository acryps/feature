import { Image, ImageAnnotations } from "./image";

export class Step {
	guide?: string[];
	screenshots?: Image[];
}

export class StepAnnotations {
	guide?: string[];
	screenshots?: ImageAnnotations[];
}