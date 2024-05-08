import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";

export class PresentInstruction extends Instruction {
	private areaName: string;
	private elements: string[] = [];

	constructor(
		private locator: string,
		private valueTags?: string[]
	){
		super();
	}

	public step(instruction: PresentInstruction): string {
		super.checkState();

		return `Find elements ${this.elements.map(element => `'${element}'`).join(', ')}.`;
	}

	public async execute(project: Project, page: Page, basePath: string, index: number) {
		const selector = project.generateSelector(this.locator);
		const valueTagSelectors = this.valueTags.map(valueTag => project.generateSelector(valueTag));

		const count = await PageParser.countElements(page, selector);

		if (count == 0) {
			console.error(`[error] could not find area to present`);
		} else {
			this.elements = await PageParser.findElementsContent(page, selector, valueTagSelectors);
		}

		await page.screenshot({
			path: `${basePath}${index}_present.jpg`
		});

		super.onSuccess(project);

		console.log(`[info] find elements '${this.elements.join(', ')}'`);
	}
}