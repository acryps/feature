import { Step } from "./step";
import { MotionPoint } from "../mouse/motion.point";
import { FeatureMetadata } from "./metadata";
import { ImageAnnotations } from "./image";
import * as filesystem from 'fs';
import * as Jimp from 'jimp';

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

			const path = `${process.env.MEDIA_PATH}/${name}`;
			const videoSource = `${path}/${process.env.MEDIA_VIDEO_NAME}${this.fileExtension.video}`;
			const metadataSource = `${path}/${this.metadataFileName}`;

			console.log(`[info] loading feature '${name}' from '${path}'`);

			if (!filesystem.existsSync(path)) {
				throw new Error(`feature does not exist at '${path}'!`);
			}

			if (filesystem.existsSync(videoSource)) {
				this.videoSource = videoSource;
			} else {
				console.warn(`[warn] video source '${videoSource}' does not exist`);
			}

			if (filesystem.existsSync(metadataSource)) {
				const metadata = JSON.parse(filesystem.readFileSync(metadataSource, 'utf8')) as FeatureMetadata;
	
				this.motion = metadata.motion;

				if (metadata.steps) {
					for (let [stepIndex, stepMetadata] of metadata.steps?.entries()) {
						const stepPath = `${path}/${this.stepsFolderName}/${stepIndex}`;
		
						let step = new Step();
						step.guide = stepMetadata.guide;
	
						if (stepMetadata.screenshots) {
							step.screenshots = [];
			
							for (let [screenshotIndex, screenshotMetadata] of stepMetadata.screenshots.entries()) {
								const screenshotPath = `${stepPath}/${screenshotIndex}${this.fileExtension.image}`;
		
								if (filesystem.existsSync(screenshotPath)) {
									const image = filesystem.readFileSync(screenshotPath);
									const annotations: ImageAnnotations = {highlight: screenshotMetadata.highlight, ignore: screenshotMetadata.ignore};
		
									step.screenshots.push({image: image, annotations: annotations});
								} else {
									console.warn(`[warn] could not find '${screenshotPath}'`);
								}
							}
						}
		
						this.steps.push(step);
					}
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
			const path = `${process.env.MEDIA_PATH}/${name}`;
			const stepsPath = `${path}/${this.stepsFolderName}`;
			
			console.log(`[info] saving feature '${name}' into '${path}'`);
			
			if (!filesystem.existsSync(`${path}/`)) {
				filesystem.mkdirSync(`${path}/`, { recursive: true });
			}
			
			if (this.videoSource) {
				const videoName = this.videoSource.split('/').at(-1);

				await filesystem.renameSync(this.videoSource, `${path}/${videoName}`);
				this.videoSource = `${path}/${videoName}`;
			}
	
			const metadata: FeatureMetadata = new FeatureMetadata();
			metadata.motion = this.motion;

			if (this.steps) {
				metadata.steps = [];
		
				for (let [stepIndex, step] of this.steps.entries()) {
					const screenshotsMetadata: {highlight: DOMRect[], ignore: DOMRect[]}[] = [];
	
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
			}
	
			filesystem.writeFileSync(`${path}/${this.metadataFileName}`, JSON.stringify(metadata));
		} catch (error) {
			console.error(`[error] failed to save execution result for feature '${name}'; '${error}'`);
		}
	}

	public async imageCompare(result: ExecutionResult) {
		const differences: {step: number, screenshot: number, difference: Buffer}[] = [];
		
		if (this.steps.length != result.steps.length) {
			throw new Error(`cannot compare execution results with different amount of steps`);
		}

		for (let [stepIndex, step] of this.steps.entries()) {
			if (step.screenshots.length != result.steps[stepIndex].screenshots.length) {
				throw new Error(`step '${stepIndex}' contains different amounts of screenshots`);
			}

			for (let [screenshotIndex, screenshot] of step.screenshots.entries()) {
				const image1 = await Jimp.read(screenshot.image);
				const image2 = await Jimp.read(result.steps[stepIndex].screenshots[screenshotIndex].image);

				const difference = Jimp.diff(image1, image2);

				if (difference.percent > 0) {
					differences.push({step: stepIndex, screenshot: screenshotIndex, difference: difference.image.bitmap.data})
				}
			}
		}

		return differences;
	}
}