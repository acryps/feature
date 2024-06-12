import { Step } from "../execution/step/step";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageInteractor } from "../page/interactor";

export class WaitWhileInstruction extends Instruction {
	constructor(
		private locator: string
	) {
		super();
	}

	async execute(project: Project, interactor: PageInteractor): Promise<Step> {
		super.initializeExecution(interactor.configuration);

		await super.screenshot(project, interactor.scraper, []);
		
		const selector = project.generateSelector(this.locator);

		await interactor.scraper.waitWhile(selector);

		await super.screenshot(project, interactor.scraper, []);

		const step = `waited while '${this.locator}' was present`;
		this.guide.push(step);

		return super.finishExecution();
	}
}