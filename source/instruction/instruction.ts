import { Page } from "puppeteer";
import { Project } from "../project";
import { Mouse } from "../mouse/mouse";
import { Image, ImageAnnotations } from "../execution/image";
import { Step } from "../execution/step";
import { ExecutionConfiguration } from "../execution/configuration";
import { PageParser } from "../page/parser";

export abstract class Instruction {
	guide: string[] = [];
	screenshots: Image[] = [];

	generateGuide: boolean;
	generateScreenshots: boolean;
	
	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		throw new Error("Method not implemented.");
	}

	initializeExecution(configuration: ExecutionConfiguration) {
		this.generateGuide = configuration.guide;
		this.generateScreenshots = configuration.screenshots;
	}

	finishExecution(): Step {
		const result: Step = {
			...(this.generateGuide ? { guide: this.guide } : {}),
			...(this.generateScreenshots ? { screenshots: this.screenshots } : {}),
		};

		this.generateGuide = null;
		this.generateScreenshots = null;
		this.guide = [];
		this.screenshots = [];

		return result;
	}

	async screenshot(project: Project, page: Page, highlight: DOMRect[]) {
		if (this.generateScreenshots) {
			const imageBuffer = await page.screenshot();

			const ignoredIds: string[] = [];

			for (let ignoreSelector of project.ignoreSelectors) {
				ignoredIds.push(...await PageParser.findMultiple(page, ignoreSelector));
			}
			
			const ignore = await PageParser.getBoundingRectangles(page, ignoredIds);

			const annotations: ImageAnnotations = {highlight: highlight, ignore: ignore}
	
			this.screenshots.push({
				image: imageBuffer,
				annotations: annotations
			});
		}
	}
}