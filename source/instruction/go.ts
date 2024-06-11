import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageInteractor } from "../page/interactor";

export class GoInstruction extends Instruction {
	constructor(
		private url: string
	) {
		super();
	}

	async execute(project: Project, interactor: PageInteractor) {
		super.initializeExecution(interactor.configuration);

		const response = await interactor.scraper.page.goto(`${this.url}`, {
			waitUntil: 'networkidle0',
		});

		if (+response.status >= 400) {
			throw new Error(`Failed to load page '${this.url}'`);
		}

		await super.screenshot(project, interactor.scraper, []);

		const step = `go to '${this.url}'`;
		this.guide.push(step);

		return super.finishExecution();
	}
}