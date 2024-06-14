import { Step } from "../execution/step/step";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { SingleElement } from "../element/single";
import { PageInteractor } from "../page/interactor";

export class ScrollToInstruction extends Instruction {
	constructor(
		private element: SingleElement
	) {
		super();
	}

	async execute(project: Project, interactor: PageInteractor): Promise<Step> {
		super.initializeExecution(interactor.configuration);

		const id = await this.element.find(interactor.scraper, project);

		await interactor.mouse.scrollIntoView(id);
		const rectangle = await interactor.scraper.getBoundingRectangle(id);
		
		let name = '';

		if (this.element.elementContent) {
			name = this.element.elementContent;
		} else {
			const content = await interactor.scraper.getElementContent(id);
			name = content ? content : this.element.getLocator();
		}

		await super.screenshot(project, interactor.scraper, [rectangle]);

		const step = `scrolled to '${name}'`;
		this.guide.push(step);

		return super.finishExecution();
	}
}