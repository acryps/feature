import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";
import { Mouse } from "../mouse/mouse";
import { ExecutionConfiguration } from "../execution/configuration";

export class PresentInstruction extends Instruction {
	private elementsContent: string[];
	private rectangles?: DOMRect[];

	constructor(
		private locator: string,
		private valueTags?: string[]
	){
		super();
	}

	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration) {
		super.initializeExecution(configuration);

		const selector = project.generateSelector(this.locator);
		const valueTagSelectors = this.valueTags.map(valueTag => project.generateSelector(valueTag));

		const ids: string[] = await PageParser.findMultiple(page, selector);

		if (ids.length == 0) {
			console.error(`[error] could not find area to present`);
		} else {
			this.elementsContent = await PageParser.getElementsContent(page, ids, valueTagSelectors);
			const first = ids.shift();
			
			this.rectangles = await PageParser.getBoundingRectangles(page, ids);
			this.rectangles.push(await PageParser.visibleBoundingRectangle(page, mouse, first));
		}

		await super.screenshot(project, page, this.rectangles);

		const step = `find elements ${this.elementsContent.map(element => `'${element}'`).join(', ')}`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return super.finishExecution();
	}
}