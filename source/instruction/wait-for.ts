import { Step } from "../execution/step/step";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageInteractor } from "../page/interactor";

export class WaitForInstruction extends Instruction {
	constructor(
		private locator: string
	) {
		super();
	}

	async execute(project: Project, interactor: PageInteractor): Promise<Step> {
		super.initializeExecution(interactor.configuration);

		const selector = project.generateSelector(this.locator);

		await super.screenshot(project, interactor.scraper, []);

		await interactor.scraper.page.waitForSelector(selector);

		await super.screenshot(project, interactor.scraper, []);

		const step = `waited for '${this.locator}'`;
		this.guide.push(step);

		return super.finishExecution();
	}
}