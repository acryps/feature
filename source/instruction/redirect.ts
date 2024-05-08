import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";

export class RedirectInstruction extends Instruction {
	private target: string;
	private source: string;

	constructor(
		private url: string
	){
		super();
	}

	public step(instruction: RedirectInstruction): string {
		super.checkState();

		return `Redirect to '${this.url}'.`;
	}

	public async execute(project: Project, page: Page, basePath: string, index: number) {
		const response = await page.goto(`${this.url}`, {
			waitUntil: 'networkidle0',
		});

		if (+response.status >= 400) {
			throw new Error(`[error] failed to load page '${this.url}'`);
		}

		super.onSuccess(project);

		console.log(`[info] redirected to '${this.url}'`);
	}
}