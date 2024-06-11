import { Step } from "../execution/step/step";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { SingleElement } from "../element/single";
import { PageInteractor } from "../page/interactor";

export class ScrollToInstruction extends Instruction {
	private name: string;
	private rectangle?: DOMRect;

	constructor(
		private element: SingleElement
	) {
		super();
	}

	async execute(project: Project, interactor: PageInteractor): Promise<Step> {
		super.initializeExecution(interactor.configuration);

		const id = await this.element.find(interactor.scraper, project);

		await interactor.mouse.scrollIntoView(id);
		this.rectangle = await interactor.scraper.getBoundingRectangle(id);

		if (this.element.elementContent) {
			this.name = this.element.elementContent;
		} else {
			const content = await interactor.scraper.getElementContent(id);
			this.name = content ? content : this.element.getLocator();
		}

		await super.screenshot(project, interactor.scraper, [this.rectangle]);

		const center = { x: this.rectangle.x + (this.rectangle.width / 2), y: this.rectangle.y + (this.rectangle.height / 2) };
		const step = `scrolled to '${this.name}' at (${center.x.toFixed(1)}, ${center.y.toFixed(1)})`;
		this.guide.push(step);

		return super.finishExecution();
	}
}