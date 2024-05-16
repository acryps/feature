import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";
import { Mouse } from "../video/mouse";

export class PresentInstruction extends Instruction {
	private elementsContent: string[] = [];
	private rectangles?: DOMRect[];

	constructor(
		private locator: string,
		private valueTags?: string[]
	){
		super();
	}

	public async execute(project: Project, page: Page, mouse: Mouse, configuration: {guide: boolean, screenshots: boolean}) {
		super.initializeExecution(configuration);

		const selector = project.generateSelector(this.locator);
		const valueTagSelectors = this.valueTags.map(valueTag => project.generateSelector(valueTag));

		const ids: string[] = await PageParser.findMultiple(page, selector);

		if (ids.length == 0) {
			console.error(`[error] could not find area to present`);
		} else {
			this.elementsContent = await PageParser.getElementsContent(page, ids, valueTagSelectors);
			this.rectangles = await PageParser.getBoundingRectangles(page, ids);
		}

		await super.screenshot(page, this.rectangles);

		const step = `find elements ${this.elementsContent.map(element => `'${element}'`).join(', ')}`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return super.finishExecution();
	}
}