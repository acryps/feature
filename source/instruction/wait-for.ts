import { ExecutionConfiguration } from "../execution/configuration";
import { Step } from "../execution/step/step";
import { Mouse } from "../mouse/mouse";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageScraper } from "../page/scraper";

export class WaitForInstruction extends Instruction {
	constructor(
		private locator: string
	) {
		super();
	}

	async execute(project: Project, scraper: PageScraper, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		const selector = project.generateSelector(this.locator);

		await super.screenshot(project, scraper, []);

		await scraper.page.waitForSelector(selector);

		await super.screenshot(project, scraper, []);

		const step = `waited for '${this.locator}'`;
		this.guide.push(step);

		return super.finishExecution();
	}
}