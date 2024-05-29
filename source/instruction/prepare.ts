import { Page } from "puppeteer";
import { Project } from "../project";
import { Mouse } from "../mouse/mouse";
import { Instruction } from "./instruction";
import { ExecutionConfiguration } from "../execution/configuration";

export class PrepareInstruction extends Instruction {
	constructor(
		private name: string,
		private route: string
	){
		super();
	}

	public async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration) {
		super.initializeExecution(configuration);

		const response = await page.goto(`${project.url}${this.route}`, {
			waitUntil: 'networkidle0',
		});

		await super.screenshot(project, page, []);

		if (+response.status >= 400) {
			throw new Error(`[error] failed to load page '${project.url}${this.route}'`);
		}

		const step = `configure product '${this.name}' at '${project.url}${this.route}'`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return super.finishExecution();
	}
}