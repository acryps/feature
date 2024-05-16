import { Page } from "puppeteer";
import { Project } from "../project";
import { Mouse } from "../video/mouse";
import { Instruction } from "./instruction";

export class PrepareInstruction extends Instruction {
	constructor(
		private name: string,
		private route: string
	){
		super();
	}

	public async execute(project: Project, page: Page, mouse: Mouse, configuration: {guide: boolean, screenshots: boolean}) {
		super.initializeExecution(configuration);

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

		return super.finishExecution();
	}
}