import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";

export class PrepareInstruction extends Instruction {
	constructor(
		private name: string,
		private route: string
	){
		super();
	}

	public step(instruction: PrepareInstruction): string {
		super.checkState();

		return `Configure product '${this.name}' at '${this.project?.baseUrl}${this.route}'`;
	}

	public async execute(project: Project, page: Page) {
		const response = await page.goto(`${project.baseUrl}${this.route}`);

		if (+response.status >= 400) {
			throw new Error(`[error] failed to load page '${project.baseUrl}${this.route}'`);
		}

		super.onSuccess(project);
	}
}