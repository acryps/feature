import { Page } from "puppeteer";
import { ExecutionConfiguration } from "../execution/configuration";
import { Step } from "../execution/step";
import { Mouse } from "../mouse/mouse";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";

export class HoverInstruction extends Instruction {
	private name: string;
	private rectangle?: DOMRect;

	constructor(
		private locator: string,
		private elementContent?: string,
	) {
		super();
	}

	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		const selector = project.generateSelector(this.locator);
		const id = await PageParser.findSingle(page, selector, this.elementContent);
		this.rectangle = await PageParser.visibleBoundingRectangle(page, mouse, id);

		if (this.elementContent) {
			this.name = this.elementContent;
		} else {
			const content = await PageParser.getElementContent(page, id);
			this.name = content ? content : this.locator;
		}

		const center = { x: this.rectangle.x + (this.rectangle.width / 2), y: this.rectangle.y + (this.rectangle.height / 2) };
		await mouse.hover(center.x, center.y);

		await super.screenshot(project, page, [this.rectangle]);

		const step = `hovering on '${this.name}' at (${center.x.toFixed(1)}, ${center.y.toFixed(1)})`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return super.finishExecution();
	}
}