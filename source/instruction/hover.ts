import { Page } from "puppeteer";
import { ExecutionConfiguration } from "../execution/configuration";
import { Step } from "../execution/step";
import { Mouse } from "../mouse/mouse";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";
import { SingleElement } from "../element/single-element";

export class HoverInstruction extends Instruction {
	private name: string;
	private rectangle?: DOMRect;

	constructor(
		private element: SingleElement
	) {
		super();
	}

	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		const id = await this.element.find(page, project);

		await mouse.scrollIntoView(page, id);
		this.rectangle = await PageParser.getBoundingRectangle(page, id);

		if (this.element.elementContent) {
			this.name = this.element.elementContent;
		} else {
			const content = await PageParser.getElementContent(page, id);
			this.name = content ? content : this.element.getLocator();
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