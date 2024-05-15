import { Page } from "puppeteer";
import { PageParser } from "../page/parser";
import { Project } from "../project";
import { Recorder } from "../video/recorder";
import { Instruction } from "./instruction";

export class PrepareInstruction extends Instruction {
	constructor(
		private name: string,
		private route: string
	){
		super();
	}

	public async execute(project: Project, page: Page, recorder?: Recorder) {
		const response = await page.goto(`${project.baseUrl}${this.route}`, {
			waitUntil: 'networkidle0',
		});

		await super.screenshot(page, []);

		if (+response.status >= 400) {
			throw new Error(`[error] failed to load page '${project.baseUrl}${this.route}'`);
		}

		const step = `configure product '${this.name}' at '${project.baseUrl}${this.route}'`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return {
			screenshots: this.screenshots,
			guide: this.guide
		};
	}
}