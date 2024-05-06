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
		const htmlTags = this.tags.map(tag => project.htmlTag(tag));

		const coordinates = await PageParser.getCoordinatesOfElement(page, htmlTags, this.elementContent);
		this.x = coordinates.x;
		this.y = coordinates.y;

		const viewport = await PageParser.getViewport(page, htmlTags);
		this.setPositionDescription(coordinates, viewport);

		await PageParser.clickElement(page, htmlTags, this.elementContent);

		if (this.elementContent) {
			this.clickableName = this.elementContent;
		} else {
			const content = await PageParser.findElementContent(page, htmlTags);
			this.clickableName = content;
		}

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