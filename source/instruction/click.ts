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

		const id = await PageParser.findSingle(page, selector, this.elementContent);

		if (this.elementContent) {
			this.clickableName = this.elementContent;
		} else {
			const content = await PageParser.getElementContent(page, id);
			this.clickableName = content;
		}

		this.rectangle = await PageParser.visibleBoundingRectangle(page, id);

		if (this.rectangle) {
			const viewport = await page.viewport();
			this.setPosition(this.rectangle, viewport);
		}

		await super.saveImageAndMetadata(page, basePath, `${index}_click`, [this.rectangle]);

		await page.mouse.click(this.rectangle.x, this.rectangle.y);

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