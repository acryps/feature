import { Page } from "puppeteer";
import { Project } from "../project";
import { Recorder } from "../video/recorder";

export abstract class Instruction {
	public guide: string[] = [];
	public screenshots: {
		image: Buffer, 
		highlight: DOMRect[], 
		ignore: DOMRect[]
	}[] = [];
	
	public async execute(project: Project, page: Page, recorder?: Recorder): Promise<{
		guide: string[];
		screenshots: {
			image: Buffer;
			highlight: DOMRect[];
			ignore: DOMRect[];
		}[];
	}> {
		throw new Error("Method not implemented.");
	}

	public async screenshot(page: Page, highlight: DOMRect[]) {
		const imageBuffer = await page.screenshot();

		this.screenshots.push({
			image: imageBuffer,
			highlight: highlight,
			ignore: []
		});
	}
}