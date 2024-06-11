import { Project } from "../project";
import { Instruction } from "./instruction";
import { SingleElement } from "../element/single";
import { PageInteractor } from "../page/interactor";

export class WriteInstruction extends Instruction {
	private fieldName: string;
	private rectangle?: DOMRect;

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
		this.rectangle = await interactor.scraper.getBoundingRectangle(id);

		const center = { x: this.rectangle.x + (this.rectangle.width / 2), y: this.rectangle.y + (this.rectangle.height / 2) };
		await interactor.mouse.hover(center.x, center.y);

		this.fieldName = await interactor.keyboard.write(id, this.content);

		await interactor.scraper.waitForUpdates();

		await super.screenshot(project, interactor.scraper, [this.rectangle]);

		const step = `write '${this.content}' in '${this.fieldName}' field`;
		this.guide.push(step);

		return super.finishExecution();
	}
}