import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";
import { Recorder } from "../video/recorder";

export class PresentInstruction extends Instruction {
	private elementsContent: string[] = [];
	private rectangles?: DOMRect[];

	constructor(
		private locator: string,
		private valueTags?: string[]
	){
		super();
	}

	public step(instruction: PresentInstruction): string {
		super.checkState();

		return `Find elements ${this.elementsContent.map(element => `'${element}'`).join(', ')}.`;
	}

	public async execute(project: Project, page: Page, basePath: string, index: number, recorder?: Recorder) {
		const selector = project.generateSelector(this.locator);
		const valueTagSelectors = this.valueTags.map(valueTag => project.generateSelector(valueTag));

		const ids: string[] = await PageParser.findMultiple(page, selector);

		if (ids.length == 0) {
			console.error(`[error] could not find area to present`);
		} else {
			this.elementsContent = await PageParser.getElementsContent(page, ids, valueTagSelectors);
			this.rectangles = await PageParser.getBoundingRectangles(page, ids);
		}

		await super.saveImageAndMetadata(page, basePath, `${index}_present`, this.rectangles);

		super.onSuccess(project);

		console.log(`[info] find elements '${this.elementsContent.join(', ')}'`);
	}
}