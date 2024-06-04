import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";
import { Mouse } from "../mouse/mouse";
import { ExecutionConfiguration } from "../execution/configuration";
import { MultiElement } from "../element/multi-element";
import { SingleElement } from "../element/single-element";

export class ShowInstruction extends Instruction {
	private elementsContent: string[];
	private rectangles?: DOMRect[];

	constructor(
		private elements: MultiElement | SingleElement,
		private valueTags: string[]
	) {
		super();
	}

	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration) {
		super.initializeExecution(configuration);

		const valueTagSelectors = this.valueTags?.map(valueTag => project.generateSelector(valueTag));
		let ids = await this.elements.find(page, project);

		if (!Array.isArray(ids)) {
			ids = [ids];
		}

		if (ids.length == 0) {
			console.error(`[error] could not find area to present`);
		} else {
			this.elementsContent = await PageParser.getElementsContent(page, ids, valueTagSelectors);
			const first = ids.shift();
			
			this.rectangles = await PageParser.getBoundingRectangles(page, ids);

			await mouse.scrollIntoView(page, first);
			this.rectangles.push(await PageParser.getBoundingRectangle(page, first));
		}

		await super.screenshot(project, page, this.rectangles);

		const step = `find elements ${this.elementsContent.map(element => `'${element}'`).join(', ')}`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return super.finishExecution();
	}
}