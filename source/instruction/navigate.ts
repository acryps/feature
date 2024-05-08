import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";

export class NavigationInstruction extends Instruction {
	private targetUrl: string;	// title of next page
	private sourceUrl: string;	// location information

	constructor(
		private locator: string,
		private title: string,
	){
		super();
	}

	public step(instruction: NavigationInstruction): string {
		super.checkState();

		return `Go to '${this.title}' '${this.targetUrl}' from '${this.sourceUrl}'.`;
	}

	public async execute(project: Project, page: Page, basePath: string, index: number) {
		const selector = project.generateSelector(this.locator);
		
		this.sourceUrl = await page.url();

		await page.screenshot({
			path: `${basePath}${index}_navigate.jpg`
		});

		const successful = await PageParser.clickElement(page, selector, this.title);

		await page.waitForNetworkIdle();

		if (successful) {
			this.targetUrl = await page.url();
		} else {
			throw new Error(`[error] navigation on '${this.locator.substring(0, 100)}' '${this.title}' was unsuccessful!`);
		}

		super.onSuccess(project);

		console.log(`[info] navigated to '${this.title}' '${this.targetUrl}' from '${this.sourceUrl}'`);
	}
}