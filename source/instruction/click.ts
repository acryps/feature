import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";

export class ClickInstruction extends Instruction {
	private clickableName: string;

	private rectangle?: DOMRect;

	private horizontal: string;
	private vertical: string;

	constructor(
		private locator: string,
		private elementContent?: string,
	){
		super();
	}

	public step(instruction: ClickInstruction): string {
		super.checkState();

		return `Clicked '${this.clickableName}' on the '${this.vertical} ${this.horizontal}'.`;
	}

	public async execute(project: Project, page: Page, basePath: string, index: number) {
		const selector = project.generateSelector(this.locator);


		this.rectangle = await PageParser.getBoundingRectangle(page, selector, this.elementContent, true);

		if (this.rectangle) {
			const viewport = await PageParser.getViewport(page);
			this.setPosition(this.rectangle, viewport);
		}

		if (this.elementContent) {
			this.clickableName = this.elementContent;
		} else {
			const content = await PageParser.findElementContent(page, selector);
			this.clickableName = content;
		}

		await super.saveImageAndMetadata(page, basePath, `${index}_click`, [this.rectangle]);

		await PageParser.clickElement(page, selector, this.elementContent);

		await page.waitForNetworkIdle();

		console.log(`[info] clicked '${this.clickableName}' on the '${this.vertical} ${this.horizontal}'`);

		super.onSuccess(project);
	}

	private setPosition(rectangle: DOMRect, viewport: {width: number, height: number}) {
		if (rectangle.x > viewport.width / 2) {
			this.horizontal = 'right';
		} else {
			this.horizontal = 'left';
		}

		if (rectangle.y > viewport.height / 2) {
			this.vertical = 'lower';
		} else {
			this.vertical = 'upper';
		}
	}
}