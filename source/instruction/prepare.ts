import { ExecutionConfiguration } from "../execution/configuration";
import { Step } from "../execution/step/step";
import { Feature } from "../feature";
import { Mouse } from "../mouse/mouse";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageScraper } from "../page/scraper";

export class PrepareInstruction extends Instruction {
	constructor(
		private feature: Feature
	) {
		super();
	}

	async execute(project: Project, scraper: PageScraper, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		await this.feature.execute(project).executeInstructions(scraper, mouse, { guide: false, screenshots: false });

		const step = `prepared feature '${this.feature.name}'`;
		this.guide.push(step);

		return super.finishExecution();
	}
}