import { Image, ImageAnnotation } from "./image";

export class Step {
	guide?: string[];
	screenshots?: Image[];
}

export class StepAnnotation {
	guide?: string[];
	screenshots?: ImageAnnotation[];
}