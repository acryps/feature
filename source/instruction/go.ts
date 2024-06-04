import { Page } from "puppeteer";
import { Project } from "../project";
import { Mouse } from "../mouse/mouse";
import { Instruction } from "./instruction";
import { ExecutionConfiguration } from "../execution/configuration";

export class GoInstruction extends Instruction {
	constructor(
		private url: string
	) {
		super();
	}

	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration) {
		super.initializeExecution(configuration);

		const response = await page.goto(`${this.url}`, {
			waitUntil: 'networkidle0',
		});

		if (+response.status >= 400) {
			throw new Error(`Failed to load page '${this.url}'`);
		}

		const step = `go to '${this.url}'`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return super.finishExecution();
	}
}