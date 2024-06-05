import { MotionPoint } from "../mouse/point";
import { StepAnnotation } from "./step/annotation";

export class FeatureMetadata {
	motion: MotionPoint[];
	steps: StepAnnotation[];
}
