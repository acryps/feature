import { ExecutionConfiguration } from "../execution/configuration";
import { Step } from "../execution/step/step";
import { Feature } from "../feature";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageInteractor } from "../page/interactor";

export class PrepareInstruction extends Instruction {
	constructor(
		private feature: Feature
	) {
		super();
	}

	async execute(project: Project, interactor: PageInteractor): Promise<Step> {
		super.initializeExecution(interactor.configuration);

		const prepareInteractor = new PageInteractor(interactor.page, new ExecutionConfiguration(false, false, false));

		await this.feature.execute(project).executeInstructions(prepareInteractor);

		const step = `prepared feature '${this.feature.name}'`;
		this.guide.push(step);

		return super.finishExecution();
	}
}