import { SingleElement } from "../element/single";
import { Step } from "../execution/step/step";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageInteractor } from "../page/interactor";

export class SelectInstruction extends Instruction {
	constructor(
		private element: SingleElement,
		private option: SingleElement
	) {
		super();
	}

	async execute(project: Project, interactor: PageInteractor): Promise<Step> {
		super.initializeExecution(interactor.configuration);

		const optionId = await this.option.find(interactor.scraper, project);

		if (!optionId) {
			throw new Error(`Could not find select option`);
		}

		const optionName = await interactor.scraper.getElementContent(optionId);
		
		const optionValue = await interactor.scraper.page.evaluate((id) => {
			return window[id].value;
		}, optionId);
		
		const id = await this.element.find(interactor.scraper, project);
		const rectangle = await interactor.scraper.getBoundingRectangle(id);
		const center = { x: rectangle.x + (rectangle.width / 2), y: rectangle.y + (rectangle.height / 2) };
		
		await interactor.mouse.scrollIntoView( id);
		await interactor.mouse.click(center.x, center.y)

		const selector = project.generateSelector(this.element.locator);
		await interactor.scraper.page.select(selector, optionValue);

		await super.screenshot(project, interactor.scraper, [rectangle]);

		const step = `selected '${optionName}'`;
		this.guide.push(step);

		return super.finishExecution();
	}
}