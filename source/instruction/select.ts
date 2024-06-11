import { SingleElement } from "../element/single";
import { ExecutionConfiguration } from "../execution/configuration";
import { Step } from "../execution/step/step";
import { Mouse } from "../mouse/mouse";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageScraper } from "../page/scraper";

export class SelectInstruction extends Instruction {
	constructor(
		private element: SingleElement,
		private option: SingleElement
	) {
		super();
	}

	async execute(project: Project, scraper: PageScraper, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		const optionId = await this.option.find(scraper, project);

		if (!optionId) {
			throw new Error(`Could not find select option`);
		}

		const optionName = await scraper.getElementContent(optionId);
		
		const optionValue = await scraper.page.evaluate((id) => {
			return window[id].value;
		}, optionId);
		
		const id = await this.element.find(scraper, project);
		const rectangle = await scraper.getBoundingRectangle(id);
		const center = { x: rectangle.x + (rectangle.width / 2), y: rectangle.y + (rectangle.height / 2) };
		
		await mouse.scrollIntoView( id);
		await mouse.click(center.x, center.y)

		const selector = project.generateSelector(this.element.locator);
		await scraper.page.select(selector, optionValue);

		await super.screenshot(project, scraper, [rectangle]);

		const step = `selected '${optionName}'`;
		this.guide.push(step);

		return super.finishExecution();
	}
}