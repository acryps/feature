import { Project } from "../project";
import { Mouse } from "../mouse/mouse";
import { Instruction } from "./instruction";
import { ExecutionConfiguration } from "../execution/configuration";
import { PageScraper } from "../page/scraper";

export class GoInstruction extends Instruction {
	constructor(
		private url: string
	) {
		super();
	}

	async execute(project: Project, scraper: PageScraper, mouse: Mouse, configuration: ExecutionConfiguration) {
		super.initializeExecution(configuration);

		const response = await scraper.page.goto(`${this.url}`, {
			waitUntil: 'networkidle0',
		});

		if (+response.status >= 400) {
			throw new Error(`Failed to load page '${this.url}'`);
		}

		await super.screenshot(project, scraper, []);

		const step = `go to '${this.url}'`;
		this.guide.push(step);

		return super.finishExecution();
	}
}