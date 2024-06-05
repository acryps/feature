import { Page } from "puppeteer";
import { ExecutionConfiguration } from "../execution/configuration";
import { Step } from "../execution/step";
import { Feature } from "../feature";
import { Mouse } from "../mouse/mouse";
import { Project } from "../project";
import { Instruction } from "./instruction";

export class PrepareInstruction extends Instruction {
	constructor(
		private feature: Feature
	) {
		super();
	}

	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		await this.feature.execute(project).executeInstructions(page, mouse, { guide: false, screenshots: false });

		const step = `prepared feature '${this.feature.name}'`;
		this.guide.push(step);

		return super.finishExecution();
	}
}