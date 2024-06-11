import { Project } from "../project";
import { Mouse } from "../mouse/mouse";
import { Image } from "../execution/image/image";
import { Step } from "../execution/step/step";
import { ExecutionConfiguration } from "../execution/configuration";
import { PageScraper } from "../page/scraper";
import { ImageAnnotation } from "../execution/image/annotation";

export abstract class Instruction {
	protected guide: string[] = [];
	protected screenshots: Image[] = [];

	private generateGuide: boolean;
	private generateScreenshots: boolean;
	
	async execute(project: Project, scraper: PageScraper, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
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

	protected async screenshot(project: Project, scraper: PageScraper, highlight: DOMRect[]) {
		if (this.generateScreenshots) {
			const image = await scraper.page.screenshot();

			const ignoredIds: string[] = [];

			for (let ignoreSelector of project.ignoredSelectors) {
				ignoredIds.push(...await scraper.findAll([], ignoreSelector, []));
			}
			
			const ignore = await scraper.getBoundingRectangles(ignoredIds);
			const annotation: ImageAnnotation = { highlight: highlight, ignore: ignore }
	
			this.screenshots.push({
				image: image,
				annotation: annotation
			});
		}
	}
}