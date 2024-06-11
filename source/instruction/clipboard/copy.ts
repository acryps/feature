import { ExecutionConfiguration } from "../../execution/configuration";
import { Step } from "../../execution/step/step";
import { Mouse } from "../../mouse/mouse";
import { Project } from "../../project";
import { Instruction } from "../instruction";
import { PageScraper } from "../../page/scraper";
import { SingleElement } from "../../element/single";
import { PageInteractor } from "../../page/interactor";

export class CopyToClipboardInstruction extends Instruction {
	constructor(
		private element: SingleElement
	) {
		super();
	}

	async execute(project: Project, interactor: PageInteractor): Promise<Step> {
		super.initializeExecution(interactor.configuration);

		const id = await this.element.find(interactor.scraper, project);
		const content = await interactor.scraper.getElementContent(id);

		await interactor.scraper.copyToClipboard(content);

		const step = `copied '${content}' to clipboard`;
		this.guide.push(step);

		return super.finishExecution();
	}
}