import { Page } from "puppeteer";
import { PageParser } from "../page/parser";
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

		return `Configure product '${this.name}' at '${this.project?.baseUrl}${this.route}'.`;
	}

	public async execute(project: Project, page: Page, basePath: string, index: number) {
		const response = await page.goto(`${project.baseUrl}${this.route}`, {
			waitUntil: 'networkidle0',
		});

		await page.screenshot({
			path: `${basePath}${index}_prepare.jpg`
		});

		if (+response.status >= 400) {
			throw new Error(`[error] failed to load page '${project.baseUrl}${this.route}'`);
		}

		super.onSuccess(project);
		
		console.log(`[info] prepared '${this.name}' on '${project.baseUrl}${this.route}'`);
	}
}