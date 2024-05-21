import { Page } from "puppeteer";
import { Project } from "../project";
import { Mouse } from "../video/mouse";

export abstract class Instruction {
	public guide: string[] = [];
	public screenshots: {
		image: Buffer, 
		highlight: DOMRect[], 
		ignore: DOMRect[]
	}[] = [];

	public generateGuide: boolean;
	public generateScreenshots: boolean;
	
	public async execute(project: Project, page: Page, mouse: Mouse, configuration: {guide: boolean, screenshots: boolean}): Promise<{
		guide: string[];
		screenshots: {
			image: Buffer;
			highlight: DOMRect[];
			ignore: DOMRect[];
		}[];
	}> {
		throw new Error("Method not implemented.");
	}

	public initializeExecution(configuration: {guide: boolean, screenshots: boolean}) {
		this.generateGuide = configuration.guide;
		this.generateScreenshots = configuration.screenshots;
	}

	public finishExecution() {
		const result = {
			screenshots: this.screenshots,
			guide: this.generateGuide ? this.guide : []
		};

		this.generateGuide = null;
		this.generateScreenshots = null;

		return result;
	}

	public async screenshot(page: Page, highlight: DOMRect[]) {
		if (this.generateScreenshots) {
			const imageBuffer = await page.screenshot();
	
			this.screenshots.push({
				image: imageBuffer,
				highlight: highlight,
				ignore: []
			});
		}
	}
}