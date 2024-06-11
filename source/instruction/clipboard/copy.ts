import { ExecutionConfiguration } from "../../execution/configuration";
import { Step } from "../../execution/step/step";
import { Mouse } from "../../mouse/mouse";
import { Project } from "../../project";
import { Instruction } from "../instruction";
import { PageScraper } from "../../page/scraper";
import { SingleElement } from "../../element/single";

export class CopyToClipboardInstruction extends Instruction {
	constructor(
		private element: SingleElement
	) {
		super();
	}

	async execute(project: Project, scraper: PageScraper, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		const id = await this.element.find(scraper, project);
		const content = await scraper.getElementContent(id);

		await scraper.copyToClipboard(content);

		const step = `copied '${content}' to clipboard`;
		this.guide.push(step);

		return super.finishExecution();
	}
}