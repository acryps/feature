import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";

export class WriteInstruction extends Instruction {
	private fieldName: string;

	constructor(
		private tags: string[],
		private content: string
	){
		super();
	}

	public step(instruction: WriteInstruction): string {
		super.checkState();

		return `Write '${this.content}' into the '${this.fieldName}' field.`;
	}

	public async execute(project: Project, page: Page) {
		const htmlTags = this.tags.map(tag => project.htmlTag(tag));

		this.fieldName = await PageParser.fillInput(this.content, page, htmlTags);

		await page.waitForNetworkIdle();

		super.onSuccess(project);

		console.log(`[info] wrote '${this.content}' in '${this.fieldName}' field`)
	}
}