import { Project } from "../project";
import { Instruction } from "./instruction";
import { SingleElement } from "../element/single";
import { PageInteractor } from "../page/interactor";

export class WriteInstruction extends Instruction {
	constructor(
		private element: SingleElement,
		private content: string
	) {
		super();
	}

	async execute(project: Project, interactor: PageInteractor) {
		super.initializeExecution(interactor.configuration);

		const id = await this.element.find(interactor.scraper, project);

		await interactor.mouse.scrollIntoView(id);
		const rectangle = await interactor.scraper.getBoundingRectangle(id);

		const center = { x: rectangle.x + (rectangle.width / 2), y: rectangle.y + (rectangle.height / 2) };
		await interactor.mouse.hover(center.x, center.y);

		const fieldName = await interactor.keyboard.write(id, this.content);

		await interactor.scraper.waitForUpdates();

		await super.screenshot(project, interactor.scraper, [rectangle]);

		const step = `write '${this.content}' in '${fieldName}' field`;
		this.guide.push(step);

		return super.finishExecution();
	}
}