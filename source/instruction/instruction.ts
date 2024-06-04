import { Page } from "puppeteer";
import { Project } from "../project";
import { Mouse } from "../mouse/mouse";
import { Image, ImageAnnotation } from "../execution/image";
import { Step } from "../execution/step";
import { ExecutionConfiguration } from "../execution/configuration";
import { PageParser } from "../page/parser";

export abstract class Instruction {
	protected guide: string[] = [];
	protected screenshots: Image[] = [];

	private generateGuide: boolean;
	private generateScreenshots: boolean;
	
	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		throw new Error("Method not implemented.");
	}

	protected initializeExecution(configuration: ExecutionConfiguration) {
		this.generateGuide = configuration.guide;
		this.generateScreenshots = configuration.screenshots;
	}

	protected finishExecution(): Step {
		const result: Step = {
			...(this.generateGuide ? { guide: this.guide } : {}),
			...(this.generateScreenshots ? { screenshots: this.screenshots } : {}),
		};

		this.guide = [];
		this.screenshots = [];
		this.generateGuide = null;
		this.generateScreenshots = null;

		return result;
	}

	protected async screenshot(project: Project, page: Page, highlight: DOMRect[]) {
		if (this.generateScreenshots) {
			const image = await page.screenshot();

			const ignoredIds: string[] = [];

			for (let ignoreSelector of project.ignoredSelectors) {
				ignoredIds.push(...await PageParser.findAll(page, [], ignoreSelector, []));
			}
			
			const ignore = await PageParser.getBoundingRectangles(page, ignoredIds);
			const annotation: ImageAnnotation = { highlight: highlight, ignore: ignore }
	
			this.screenshots.push({
				image: image,
				annotation: annotation
			});
		}
	}
}