import { MotionPoint } from "../video/motion-point";

export class FeatureMetadata {
	public motion: MotionPoint[];
	public steps: StepAnnotations[];
}

export class StepAnnotations {
	public guide: string[];
	public screenshots: ImageAnnotations[];
}

export class ImageAnnotations {
	public highlight: DOMRect[];
	public ignore: DOMRect[];
}