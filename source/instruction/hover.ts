import { Step } from "../execution/step/step";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { SingleElement } from "../element/single";
import { PageInteractor } from "../page/interactor";

export class HoverInstruction extends Instruction {
	constructor(
		private element: SingleElement
	) {
		super();
	}

	async execute(project: Project, interactor: PageInteractor): Promise<Step> {
		super.initializeExecution(interactor.configuration);

		const id = await this.element.find(interactor.scraper, project);
		let name = this.element.getLocator();
		
		if (this.element.elementContent) {
			name = this.element.elementContent;
		} else {
			const content = await interactor.scraper.getElementContent(id);
			name = content ? content : name;
		}

		await interactor.mouse.scrollIntoView(id);

		const rectangle = await interactor.scraper.getBoundingRectangle(id);
		const center = { x: rectangle.x + (rectangle.width / 2), y: rectangle.y + (rectangle.height / 2) };

		await interactor.mouse.hover(center.x, center.y);

		await super.screenshot(project, interactor.scraper, [rectangle]);

		const step = `hovering on '${name}'`;
		this.guide.push(step);

		return super.finishExecution();
	}
}