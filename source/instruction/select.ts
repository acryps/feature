import { Page } from "puppeteer";
import { SingleElement } from "../element/single";
import { ExecutionConfiguration } from "../execution/configuration";
import { Step } from "../execution/step/step";
import { Mouse } from "../mouse/mouse";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";

export class SelectInstruction extends Instruction {
	constructor(
		private element: SingleElement,
		private option: SingleElement
	) {
		super();
	}

	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		const optionId = await this.option.find(page, project);

		if (!optionId) {
			throw new Error(`Could not find select option`);
		}

		const optionName = await PageParser.getElementContent(page, optionId);
		
		const optionValue = await page.evaluate((id) => {
			return window[id].value;
		}, optionId);
		
		const id = await this.element.find(page, project);
		const rectangle = await PageParser.getBoundingRectangle(page, id);
		const center = { x: rectangle.x + (rectangle.width / 2), y: rectangle.y + (rectangle.height / 2) };
		
		await mouse.scrollIntoView(page, id);
		await mouse.click(center.x, center.y)

		const selector = project.generateSelector(this.element.locator);
		await page.select(selector, optionValue);

		await super.screenshot(project, page, [rectangle]);

		const step = `selected '${optionName}'`;
		this.guide.push(step);

		return super.finishExecution();
	}
}