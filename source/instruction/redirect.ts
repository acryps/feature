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

		return `Redirect to '${this.url}'`;
	}

	public async execute(project: Project, page: Page) {
		const response = await page.goto(`${this.url}`);

		if (+response.status >= 400) {
			throw new Error(`[error] failed to load page '${this.url}'`);
		}

		super.onSuccess(project);
	}
}