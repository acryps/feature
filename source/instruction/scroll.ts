import { Page } from "puppeteer";
import { ExecutionConfiguration } from "../execution/configuration";
import { Step } from "../execution/step/step";
import { PageParser } from "../page/parser";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { Mouse } from "../mouse/mouse";
import { SingleElement } from "../element/single";

export class ScrollToInstruction extends Instruction {
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

		await super.screenshot(project, page, [this.rectangle]);

		const center = { x: this.rectangle.x + (this.rectangle.width / 2), y: this.rectangle.y + (this.rectangle.height / 2) };
		const step = `scrolled to '${this.name}' at (${center.x.toFixed(1)}, ${center.y.toFixed(1)})`;
		this.guide.push(step);

		return super.finishExecution();
	}
}