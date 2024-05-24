import { Page } from "puppeteer";
import { Project } from "../project";
import { Mouse } from "../video/mouse";
import { ImageAnnotations } from "../execution/metadata";
import { AnnotatedImage } from "../execution/image";

export abstract class Instruction {
	public guide: string[] = [];
	public screenshots: AnnotatedImage[] = [];

	public generateGuide: boolean;
	public generateScreenshots: boolean;
	
	public async execute(project: Project, page: Page, mouse: Mouse, configuration: {guide: boolean, screenshots: boolean}): Promise<{
		guide: string[];
		screenshots: AnnotatedImage[];
	}> {
		throw new Error("Method not implemented.");
	}

	public initializeExecution(configuration: {guide: boolean, screenshots: boolean}) {
		this.generateGuide = configuration.guide;
		this.generateScreenshots = configuration.screenshots;
	}

	public finishExecution(): {guide: string[], screenshots: AnnotatedImage[]} {
		const result = {
			guide: this.generateGuide ? this.guide : [],
			screenshots: this.screenshots,
		};

		this.generateGuide = null;
		this.generateScreenshots = null;

		return result;
	}

	public async screenshot(page: Page, highlight: DOMRect[]) {
		if (this.generateScreenshots) {
			const imageBuffer = await page.screenshot();
			const annotations: ImageAnnotations = {highlight: highlight, ignore: []}
	
			this.screenshots.push({
				image: imageBuffer,
				annotations: annotations
			});
		}
	}
}