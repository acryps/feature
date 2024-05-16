import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";
import { Recorder } from "../video/recorder";

export class WriteInstruction extends Instruction {
	private fieldName: string;
	private rectangle?: DOMRect;

	constructor(
		private locator: string,
		private content: string
	){
		super();
	}

	public async execute(project: Project, page: Page, configuration: {guide: boolean, screenshots: boolean}, recorder?: Recorder) {
		super.initializeExecution(configuration);

		const selector = project.generateSelector(this.locator);
		const id = await PageParser.findSingle(page, selector);

		this.rectangle = await PageParser.visibleBoundingRectangle(page, id);

		const center = {x: this.rectangle.x + (this.rectangle.width / 2), y: this.rectangle.y + (this.rectangle.height / 2)};

		if (recorder) {
			await recorder.simulateCursorMovement(center.x, center.y);
		}

		await page.mouse.click(center.x, center.y);

		this.fieldName = await PageParser.inputContent(page, id, this.content);

		await page.waitForNetworkIdle();

		await super.screenshot(page, [this.rectangle]);

		const step = `write '${this.content}' in '${this.fieldName}' field`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return super.finishExecution();
	}
}