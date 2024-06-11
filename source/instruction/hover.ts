import { ExecutionConfiguration } from "../execution/configuration";
import { Step } from "../execution/step/step";
import { Mouse } from "../mouse/mouse";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageScraper } from "../page/scraper";
import { SingleElement } from "../element/single";

export class HoverInstruction extends Instruction {
	private name: string;
	private rectangle?: DOMRect;

	constructor(
		private element: SingleElement
	) {
		super();
	}

	async execute(project: Project, scraper: PageScraper, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		const id = await this.element.find(scraper, project);

		await mouse.scrollIntoView(id);
		this.rectangle = await scraper.getBoundingRectangle(id);

		if (this.element.elementContent) {
			this.name = this.element.elementContent;
		} else {
			const content = await scraper.getElementContent(id);
			this.name = content ? content : this.element.getLocator();
		}

		const center = { x: this.rectangle.x + (this.rectangle.width / 2), y: this.rectangle.y + (this.rectangle.height / 2) };
		await mouse.hover(center.x, center.y);

		await super.screenshot(project, scraper, [this.rectangle]);

		const step = `hovering on '${this.name}' at (${center.x.toFixed(1)}, ${center.y.toFixed(1)})`;
		this.guide.push(step);

		return super.finishExecution();
	}
}