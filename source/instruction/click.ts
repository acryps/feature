import { Page, Viewport } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";
import { Mouse } from "../mouse/mouse";
import { ExecutionConfiguration } from "../execution/configuration";
import { SingleElement } from "../element/single";

export class ClickInstruction extends Instruction {
	private name: string;
	private rectangle?: DOMRect;

	private horizontal: string;
	private vertical: string;

	constructor(
		private element: SingleElement
	) {
		super();
	}

	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration) {
		super.initializeExecution(configuration);

		const id = await this.element.find(page, project);

		if (this.element.elementContent) {
			this.name = this.element.elementContent;
		} else {
			const content = await PageParser.getElementContent(page, id);
			this.name = content ? content : this.element.getLocator();
		}

		await mouse.scrollIntoView(page, id);
		this.rectangle = await PageParser.getBoundingRectangle(page, id);

		if (this.rectangle) {
			const viewport = await page.viewport();
			this.setPosition(this.rectangle, viewport);
		}

		await super.screenshot(project, page, [this.rectangle]);

		const center = { x: this.rectangle.x + (this.rectangle.width / 2), y: this.rectangle.y + (this.rectangle.height / 2) };
		await mouse.click(center.x, center.y);

		const step = `click '${this.name}' on the ${this.vertical} ${this.horizontal} at (${center.x.toFixed(1)}, ${center.y.toFixed(1)})`;
		this.guide.push(step);

		return super.finishExecution();
	}

	private setPosition(rectangle: DOMRect, viewport: Viewport) {
		if (rectangle.x > viewport.width / 2) {
			this.horizontal = 'right';
		} else {
			this.horizontal = 'left';
		}

		if (rectangle.y > viewport.height / 2) {
			this.vertical = 'lower';
		} else {
			this.vertical = 'upper';
		}
	}
}