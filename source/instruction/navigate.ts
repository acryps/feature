import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";

export class NavigationInstruction extends Instruction {
	private targetUrl: string;	// title of next page
	private sourceUrl: string;	// location information

	constructor(
		private tags: string[],
		private title: string,
	){
		super();
	}

	public step(instruction: NavigationInstruction): string {
		super.checkState();

		return `Go to '${this.title}' '${this.targetUrl}' from '${this.sourceUrl}'.`;
	}

	public async execute(project: Project, page: Page) {
		const htmlTags = this.tags.map(tag => project.htmlTag(tag));
		this.sourceUrl = await page.url();

		const successful = await PageParser.clickElementByContent(page, htmlTags, this.title);

		await page.waitForNetworkIdle();

		if (successful) {
			this.targetUrl = await page.url();
		} else {
			throw new Error(`[error] navigation on '${this.tags.join(' ')}' '${this.title}' was unsuccessful!`);
		}

		super.onSuccess(project);

		console.log(`[info] navigated to '${this.title}' '${this.targetUrl}' from '${this.sourceUrl}'`);
	}
}