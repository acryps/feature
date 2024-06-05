import { Page } from "puppeteer";
import { ExecutionConfiguration } from "../execution/configuration";
import { Step } from "../execution/step";
import { Mouse } from "../mouse/mouse";
import { Project } from "../project";
import { Instruction } from "./instruction";

export class WaitForInstruction extends Instruction {
	constructor(
		private locator: string
	) {
		super();
	}

	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		const selector = project.generateSelector(this.locator);

		await super.screenshot(project, page, []);

		await page.waitForSelector(selector);

		const step = `waited for '${this.locator}'`;
		this.guide.push(step);

		return super.finishExecution();
	}
}