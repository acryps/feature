import { Step } from "./step";
import { MotionPoint } from "../video/motion-point";
import { FeatureMetadata, ImageAnnotations } from "./metadata";
import * as filesystem from 'fs';

export class ExecutionResult {
	private metadataFileName = 'feature.json';
	private stepsFolderName = 'steps';

	private fileExtension = {
		image: '.png',
		video: '.webm'
	};

	constructor(
		public videoSource?: string,
		public motion?: MotionPoint[],
		public steps?: Step[],
	) {}
	
	public load(name: string) {
		try {
			this.steps = [];
			
			let basePath = `${process.env.MEDIA_PATH}/${name}`;

			if (!filesystem.existsSync(basePath)) {
				throw new Error(`feature does not exist at '${basePath}'!`);
			}

			let videoSource = `${basePath}/${process.env.MEDIA_VIDEO_NAME}${this.fileExtension.video}`;
			let metadataSource = `${basePath}/${this.metadataFileName}`;
	
			if (filesystem.existsSync(videoSource)) {
				this.videoSource = videoSource;
			} else {
				console.warn(`[warn] video source '${videoSource}' does not exist`);
			}

			if (filesystem.existsSync(metadataSource)) {
				let metadata = JSON.parse(filesystem.readFileSync(metadataSource, 'utf8')) as FeatureMetadata;
	
				this.motion = metadata.motion;
	
				for (let [stepIndex, stepMetadata] of metadata.steps.entries()) {
					const stepPath = `${basePath}/${this.stepsFolderName}/${stepIndex}`;
	
					let step = new Step();
					step.guide = stepMetadata.guide;

					if (stepMetadata.screenshots) {
						step.screenshots = [];
		
						for (let [screenshotIndex, screenshotMetadata] of stepMetadata.screenshots.entries()) {
							const screenshotPath = `${stepPath}/${screenshotIndex}${this.fileExtension.image}`;
	
							if (filesystem.existsSync(screenshotPath)) {
								const image = filesystem.readFileSync(screenshotPath);
								const annotations: ImageAnnotations = {highlight: screenshotMetadata.highlight, ignore: screenshotMetadata.ignore};
	
								step.screenshots.push({image: image, annotations});
							} else {
								console.warn(`[warn] could not find '${screenshotPath}'`);
							}
						}
					}
	
					this.steps.push(step);
				}
			} else {
				console.warn(`[warn] metadata '${metadataSource}' does not exist`);
			}
		} catch (error) {
			console.error(`[error] failed to load feature '${name}': '${error}'`);
		}
	}

	public async save(name: string) {
		try {
			const basePath = `${process.env.MEDIA_PATH}/${name}`;
			const stepsPath = `${basePath}/${this.stepsFolderName}`;
	
			console.log(`[info] saving feature '${name}' into '${basePath}'`);
	
			if (!filesystem.existsSync(`${basePath}/`)) {
				filesystem.mkdirSync(`${basePath}/`, { recursive: true });
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
				let screenshotsMetadata: { highlight: DOMRect[], ignore: DOMRect[]}[] = [];

				if (step.screenshots) {
					if (!filesystem.existsSync(`${stepsPath}/${stepIndex}`)) {
						filesystem.mkdirSync(`${stepsPath}/${stepIndex}`, { recursive: true });
					}

					for (let [screenshotIndex, screenshot] of step.screenshots.entries()) {
						screenshotsMetadata.push({highlight: screenshot.annotations.highlight, ignore: screenshot.annotations.ignore});
		
						await filesystem.writeFileSync(`${stepsPath}/${stepIndex}/${screenshotIndex}${this.fileExtension.image}`, screenshot.image);
					}
				}
	
				metadata.steps.push({
					...(step.guide ? {guide: step.guide} : {}),
					...(step.screenshots ? {screenshots: screenshotsMetadata} : {})
				});
			}
	
			filesystem.writeFileSync(`${basePath}/${this.metadataFileName}`, JSON.stringify(metadata));
		} catch (error) {
			console.error(`[error] failed to save execution result for feature '${name}'; '${error}'`);
		}
	}

	public imageCompare(result: ExecutionResult) {
		// todo: compare each image in the execution steps to each other
	}
}