import { Step } from "./step/step";
import { MotionPoint } from "../mouse/point";
import { FeatureMetadata } from "./metadata";
import { ImageDifference } from "./image/difference";
import * as filesystem from 'fs';
import * as Jimp from 'jimp';
import { ImageAnnotation } from "./image/annotation";

export class ExecutionResult {
	private readonly differenceThreshold = 0.0001;

	private readonly metadataFileName = 'feature.json';
	private readonly stepsFolderName = 'steps';

	private readonly fileExtension = {
		image: '.png',
		video: '.webm'
	};

	constructor(
		public videoSource?: string,
		public motion?: MotionPoint[],
		public steps?: Step[],
	) {}
	
	load(path: string): ExecutionResult {
		try {
			this.steps = [];
			const videoSource = `${path}/${process.env.MEDIA_VIDEO_NAME}${this.fileExtension.video}`;
			const metadataSource = `${path}/${this.metadataFileName}`;

			if (!filesystem.existsSync(path)) {
				throw new Error(`Feature does not exist at '${path}'`);
			}

			if (filesystem.existsSync(videoSource)) {
				this.videoSource = videoSource;
			}

			if (filesystem.existsSync(metadataSource)) {
				const metadata = JSON.parse(filesystem.readFileSync(metadataSource, 'utf8')) as FeatureMetadata;
	
				this.motion = metadata.motion;

				if (metadata.steps) {
					for (let [stepIndex, stepMetadata] of metadata.steps.entries()) {
						const stepPath = `${path}/${this.stepsFolderName}/${stepIndex}`;

						let step = new Step();
						step.guide = stepMetadata.guide;
	
						if (stepMetadata.screenshots) {
							step.screenshots = [];
			
							for (let [screenshotIndex, screenshotMetadata] of stepMetadata.screenshots.entries()) {
								const screenshotPath = `${stepPath}/${screenshotIndex}${this.fileExtension.image}`;
		
								if (filesystem.existsSync(screenshotPath)) {
									const image = filesystem.readFileSync(screenshotPath);
									const annotation: ImageAnnotation = { highlight: screenshotMetadata.highlight, ignore: screenshotMetadata.ignore };
		
									step.screenshots.push({ image: image, annotation: annotation });
								} else {
									throw new Error(`Could not find screenshot ${screenshotIndex} for step ${stepIndex}. Searching at '${screenshotPath}'`);
								}
							}
						}
		
						this.steps.push(step);
					}
				}
			}
		} catch (error) {
			throw new Error(`Failed to load feature '${name}': ${error.message}`);
		}

		return this;
	}

	async save(path: string) {
		try {
			const stepsPath = `${path}/${this.stepsFolderName}`;

			if (!filesystem.existsSync(`${path}/`)) {
				filesystem.mkdirSync(`${path}/`, { recursive: true });
			}
			
			if (this.videoSource) {
				const videoName = `${process.env.MEDIA_VIDEO_NAME}${this.fileExtension.video}`;

				await filesystem.renameSync(this.videoSource, `${path}/${videoName}`);
				this.videoSource = `${path}/${videoName}`;
			}
	
			const metadata: FeatureMetadata = new FeatureMetadata();
			metadata.motion = this.motion;

			if (this.steps) {
				metadata.steps = [];
		
				for (let [stepIndex, step] of this.steps.entries()) {
					const screenshotsMetadata: ImageAnnotation[] = [];
	
					if (step.screenshots) {
						if (!filesystem.existsSync(`${stepsPath}/${stepIndex}`)) {
							filesystem.mkdirSync(`${stepsPath}/${stepIndex}`, { recursive: true });
						}
	
						for (let [screenshotIndex, screenshot] of step.screenshots.entries()) {
							screenshotsMetadata.push({ highlight: screenshot.annotation.highlight, ignore: screenshot.annotation.ignore });
			
							await filesystem.writeFileSync(`${stepsPath}/${stepIndex}/${screenshotIndex}${this.fileExtension.image}`, screenshot.image);
						}
					}
		
					metadata.steps.push({
						...(step.guide ? { guide: step.guide } : {}),
						...(step.screenshots ? { screenshots: screenshotsMetadata } : {})
					});
				}
			}
	
			filesystem.writeFileSync(`${path}/${this.metadataFileName}`, JSON.stringify(metadata));
		} catch (error) {
			throw new Error(`Failed to save execution result for feature '${name}': ${error.message}`);
		}
	}

	async getImageDifferences(result: ExecutionResult): Promise<ImageDifference[]> {
		const differences: ImageDifference[] = [];

		if (this.steps.length != result.steps.length) {
			throw new Error(`Cannot compare execution results with different amount of steps`);
		}

		for (let [stepIndex, step] of this.steps.entries()) {
			if (step.screenshots.length != result.steps[stepIndex].screenshots.length) {
				throw new Error(`Step '${stepIndex}' contains different amounts of screenshots`);
			}

			for (let [screenshotIndex, screenshot] of step.screenshots.entries()) {
				let image1 = await Jimp.read(screenshot.image);
				let image2 = await Jimp.read(result.steps[stepIndex].screenshots[screenshotIndex].image);

				const ignored = [
					...result.steps[stepIndex].screenshots[screenshotIndex].annotation.ignore,
					...this.steps[stepIndex].screenshots[screenshotIndex].annotation.ignore
				];

				image1 = this.applyMask(image1, ignored);
				image2 = this.applyMask(image2, ignored);

				const difference = Jimp.diff(image1, image2);

				if (difference.percent > this.differenceThreshold) {
					differences.push({ step: stepIndex, screenshot: screenshotIndex, difference: difference.image.bitmap.data })
				}
			}
		}

		return differences;
	}

	private applyMask(image: Jimp, rectangles: DOMRect[]): Jimp {
		for (let rectangle of rectangles) {
			if (rectangle.width > 0 && rectangle.height > 0) {
				const mask = new Jimp(rectangle.width, rectangle.height, 0xffffffff);
				image = image.composite(mask, rectangle.x, rectangle.y);
			}
		}

		return image;
	}
}