import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";
import { Recorder } from "../video/recorder";

export class NavigationInstruction extends Instruction {
	private targetUrl: string;	// title of next page
	private sourceUrl: string;	// location information

	private rectangle?: DOMRect;

	constructor(
		private locator: string,
		private title: string,
	){
		super();
	}

	public async execute(project: Project, page: Page, recorder?: Recorder) {
		const selector = project.generateSelector(this.locator);
		
		const id = await PageParser.findSingle(page, selector, this.title);
		
		this.sourceUrl = await page.url();
		this.rectangle = await PageParser.visibleBoundingRectangle(page, id);
		
		await super.screenshot(page, [this.rectangle]);

		const center = {x: this.rectangle.x + (this.rectangle.width / 2), y: this.rectangle.y + (this.rectangle.height / 2)};

		if (recorder) {
			await recorder.simulateCursorMovement(center.x, center.y);
		}

		await page.mouse.click(this.rectangle.x, this.rectangle.y);
		await page.waitForNetworkIdle();

		const step = `navigate to '${this.title}' '${this.targetUrl}' from '${this.sourceUrl}'`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return {
			screenshots: this.screenshots,
			guide: this.guide
		};
	}
}