import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";

export class WriteInstruction extends Instruction {
	private fieldName: string;

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

	public async execute(project: Project, page: Page, index: number) {
		const selector = project.generateSelector(this.locator);

		this.fieldName = await PageParser.fillInput(this.content, page, selector);

		await page.waitForNetworkIdle();

		await PageParser.highlightElement(page, selector);
		await page.screenshot({
			path: `${index}_write.jpg`
		});

		super.onSuccess(project);

		console.log(`[info] wrote '${this.content}' in '${this.fieldName}' field`)
	}
}