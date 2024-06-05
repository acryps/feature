import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";
import { Mouse } from "../mouse/mouse";
import { ExecutionConfiguration } from "../execution/configuration";
import { SingleElement } from "../element/single-element";

export class WriteInstruction extends Instruction {
	private fieldName: string;
	private rectangle?: DOMRect;

	constructor(
		private element: SingleElement,
		private content: string
	) {
		super();
	}

	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration) {
		super.initializeExecution(configuration);

		const id = await this.element.find(page, project);

		await mouse.scrollIntoView(page, id);
		this.rectangle = await PageParser.getBoundingRectangle(page, id);

		const center = { x: this.rectangle.x + (this.rectangle.width / 2), y: this.rectangle.y + (this.rectangle.height / 2) };
		await mouse.hover(center.x, center.y);

		this.fieldName = await PageParser.inputContent(page, id, this.content);

		await PageParser.waitForUpdates(page);

		await super.screenshot(project, page, [this.rectangle]);

		const step = `write '${this.content}' in '${this.fieldName}' field`;
		this.guide.push(step);

		return super.finishExecution();
	}
}