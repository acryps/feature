import { MotionPoint } from "../video/motion-point";

export class FeatureMetadata {
	public motion: MotionPoint[];
	public steps: StepMetadata[];
}

export class StepMetadata {
	public guide: string[];
	public screenshots: ImageMetadata[];
}

export class ImageMetadata {
	public highlight: DOMRect[];
	public ignore: DOMRect[];
}