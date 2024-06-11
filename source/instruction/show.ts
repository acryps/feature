import { Project } from "../project";
import { Instruction } from "./instruction";
import { MultipleElement } from "../element/multiple";
import { SingleElement } from "../element/single";
import { PageInteractor } from "../page/interactor";

export class ShowInstruction extends Instruction {
	private elementsContent: string[];
	private rectangles?: DOMRect[];

	constructor(
		private elements: MultipleElement | SingleElement,
		private valueTags: string[]
	) {
		super();
	}

	async execute(project: Project, interactor: PageInteractor) {
		super.initializeExecution(interactor.configuration);

		const valueTagSelectors = this.valueTags?.map(valueTag => project.generateSelector(valueTag));
		let ids = await this.elements.find(interactor.scraper, project);

		if (!Array.isArray(ids)) {
			ids = [ids];
		}

		if (ids.length == 0) {
			throw new Error(`Could not find elements to show`);
		} else {
			this.elementsContent = await interactor.scraper.getElementsContent(ids, valueTagSelectors);
			const first = ids.shift();
			
			this.rectangles = await interactor.scraper.getBoundingRectangles(ids);

			await interactor.mouse.scrollIntoView(first);
			this.rectangles.push(await interactor.scraper.getBoundingRectangle(first));
		}

		await super.screenshot(project, interactor.scraper, this.rectangles);

		const step = `find elements ${this.elementsContent.map(element => `'${element}'`).join(', ')}`;
		this.guide.push(step);

		return super.finishExecution();
	}
}