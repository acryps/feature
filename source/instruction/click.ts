import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";

export class ClickInstruction extends Instruction {
	private clickableName: string;

	private x: number;
	private y: number;

	private horizontal: string;
	private vertical: string;

	constructor(
		private tags: string[],
		private elementContent?: string
	){
		super();
	}

	public step(instruction: ClickInstruction): string {
		super.checkState();

		return `Clicked '${this.clickableName}' on the '${this.vertical} ${this.horizontal}'.`;
	}

	public async execute(project: Project, page: Page) {
		const selector = project.generateSelector(this.tags);

		const coordinates = await PageParser.getCoordinatesOfElement(page, selector, this.elementContent);
		this.x = coordinates.x;
		this.y = coordinates.y;

		const viewport = await PageParser.getViewport(page);
		this.setPositionDescription(coordinates, viewport);

		if (this.elementContent) {
			this.clickableName = this.elementContent;
		} else {
			const content = await PageParser.findElementContent(page, selector);
			this.clickableName = content;
		}
		
		await PageParser.clickElement(page, selector, this.elementContent);
		
		await page.waitForNetworkIdle();

		console.log(`[info] clicked '${this.clickableName}' on the '${this.vertical} ${this.horizontal}'`);

		super.onSuccess(project);
	}

	private setPositionDescription(coordinates: {x: number, y: number}, viewport: {width: number, height: number}) {
		if (coordinates.x > viewport.width / 2) {
			this.horizontal = 'right';
		} else {
			this.horizontal = 'left';
		}

		if (coordinates.y > viewport.height / 2) {
			this.vertical = 'lower';
		} else {
			this.vertical = 'upper';
		}
	}
}