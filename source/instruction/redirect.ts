import { Page } from "puppeteer";
import { Project } from "../project";
import { Mouse } from "../video/mouse";
import { Instruction } from "./instruction";

export class RedirectInstruction extends Instruction {
	private target: string;
	private source: string;

	constructor(
		private url: string
	){
		super();
	}

	public async execute(project: Project, page: Page, mouse: Mouse, configuration: {guide: boolean, screenshots: boolean}) {
		super.initializeExecution(configuration);

		const response = await page.goto(`${this.url}`, {
			waitUntil: 'networkidle0',
		});

		if (+response.status >= 400) {
			throw new Error(`[error] failed to load page '${this.url}'`);
		}

		const step = `redirect to '${this.url}'`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return super.finishExecution();
	}
}