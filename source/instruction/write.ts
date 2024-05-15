import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";
import { Recorder } from "../video/recorder";

export class WriteInstruction extends Instruction {
	private fieldName: string;
	private rectangle?: DOMRect;

	constructor(
		private locator: string,
		private content: string
	){
		super();
	}

	public step(instruction: WriteInstruction): string {
		super.checkState();

		return `Write '${this.content}' into the '${this.fieldName}' field.`;
	}

	public async execute(project: Project, page: Page, basePath: string, index: number, recorder?: Recorder) {
		const selector = project.generateSelector(this.locator);
		const id = await PageParser.findSingle(page, selector);

		this.rectangle = await PageParser.visibleBoundingRectangle(page, id);
		this.fieldName = await PageParser.inputContent(page, id, this.content);

		await page.waitForNetworkIdle();

		await super.saveImageAndMetadata(page, basePath, `${index}_write`, [this.rectangle]);

		super.onSuccess(project);

		console.log(`[info] wrote '${this.content}' in '${this.fieldName}' field`)
	}
}