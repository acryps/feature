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
		private tags: string[]
	){
		super();
	}

	public step(instruction: ClickInstruction): string {
		super.checkState();

		return ``;
	}

	public async execute(project: Project, page: Page) {
		const htmlTags = this.tags.map(tag => project.htmlTag(tag));

		const content = await PageParser.findElementContent(page, htmlTags);
		this.clickableName = content;

		const coordinates = await PageParser.getCoordinatesOfElement(page, htmlTags);
		this.x = coordinates.x;
		this.y = coordinates.y;

		const viewport = await PageParser.getViewport(page, htmlTags);
		this.setPositionDescription(coordinates, viewport);

		await PageParser.clickElement(page, htmlTags);

		console.log(`[info] clicked button '${this.clickableName}' on the '${this.vertical} ${this.horizontal}'`);

		super.onSuccess(project);
	}

	private setPositionDescription(coordinates: {x: number, y: number}, viewport: {width: number, height: number}) {
		if (coordinates.x > viewport.width / 2) {
			this.horizontal = 'right';
		} else {
			this.horizontal = 'left';
		}

		if (coordinates.y > viewport.height / 2) {
			this.vertical = 'bottom';
		} else {
			this.vertical = 'top';
		}
	}
}