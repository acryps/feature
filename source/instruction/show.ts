import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageScraper } from "../page/scraper";
import { Mouse } from "../mouse/mouse";
import { ExecutionConfiguration } from "../execution/configuration";
import { MultipleElement } from "../element/multiple";
import { SingleElement } from "../element/single";

export class ShowInstruction extends Instruction {
	private elementsContent: string[];
	private rectangles?: DOMRect[];

	constructor(
		private elements: MultipleElement | SingleElement,
		private valueTags: string[]
	) {
		super();
	}

	async execute(project: Project, scraper: PageScraper, mouse: Mouse, configuration: ExecutionConfiguration) {
		super.initializeExecution(configuration);

		const valueTagSelectors = this.valueTags?.map(valueTag => project.generateSelector(valueTag));
		let ids = await this.elements.find(scraper, project);

		if (!Array.isArray(ids)) {
			ids = [ids];
		}

		if (ids.length == 0) {
			throw new Error(`Could not find elements to show`);
		} else {
			this.elementsContent = await scraper.getElementsContent(ids, valueTagSelectors);
			const first = ids.shift();
			
			this.rectangles = await scraper.getBoundingRectangles(ids);

			await mouse.scrollIntoView(first);
			this.rectangles.push(await scraper.getBoundingRectangle(first));
		}

		await super.screenshot(project, scraper, this.rectangles);

		const step = `find elements ${this.elementsContent.map(element => `'${element}'`).join(', ')}`;
		this.guide.push(step);

		return super.finishExecution();
	}
}