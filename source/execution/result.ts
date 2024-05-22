import { Step } from "./step";
import { MotionPoint } from "../video/motion-point";
import { FeatureMetadata } from "./metadata";
import * as filesystem from 'fs';

export class ExecutionResult {
	constructor(
		public videoSource?: string,
		public motion?: MotionPoint[],
		public steps?: Step[],
	) {}
	
	public load(path: string) {
		// todo: load an execution result
	}

	public async save(path: string, name: string) {
		try {
			const basePath = `${path}/${name}`;
			const stepsPath = `${basePath}/steps`;
	
			console.log(`[info] saving feature '${name}' into '${basePath}'`);
	
			if (!filesystem.existsSync(`${stepsPath}/`)) {
				filesystem.mkdirSync(`${stepsPath}/`, { recursive: true });
			}
	
			const videoName = this.videoSource.split('/').at(-1);
	
			await filesystem.rename(this.videoSource, `${basePath}/${videoName}`, (error) => {
				if (error) {
					console.error(`[error] failed to move video: '${error.message}'`);
				}
			});
	
			let metadata: FeatureMetadata = new FeatureMetadata();
			metadata.motion = this.motion;
			metadata.steps = [];
	
			for (let [stepIndex, step] of this.steps.entries()) {
				if (!filesystem.existsSync(`${stepsPath}/${stepIndex}`)) {
					filesystem.mkdirSync(`${stepsPath}/${stepIndex}`);
				}
	
				let screenshotsMetadata: { highlight: DOMRect[], ignore: DOMRect[]}[] = [];
	
				for (let [screenshotIndex, screenshot] of step.screenshots.entries()) {
					screenshotsMetadata.push({highlight: screenshot.highlight, ignore: screenshot.ignore});
	
					filesystem.writeFile(`${stepsPath}/${stepIndex}/${screenshotIndex}.png`, screenshot.image, (error) => {
						if (error) {
							console.error(`[error] failed to save screenshot '${error.message}'`);
						}
					});
				}
	
				metadata.steps.push({guide: step.guide, screenshots: screenshotsMetadata});
			}
	
			filesystem.writeFile(`${basePath}/feature.json`, JSON.stringify(metadata), (error) => {
				if (error) {
					console.error(`[error] failed to save feature metadata '${error.message}'`);
				}
			});
		} catch (error) {
			console.error(`[error] failed to save execution result for feature '${name}'; '${error}'`);
		}
	}

	public imageCompare(result: ExecutionResult) {
		// todo: compare each image in the execution steps to each other
	}
}