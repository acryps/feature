import { Page } from "puppeteer";
import { ExecutionConfiguration } from "../../execution/configuration";
import { Step } from "../../execution/step/step";
import { Mouse } from "../../mouse/mouse";
import { Project } from "../../project";
import { Instruction } from "../instruction";
import { PageParser } from "../../page/parser";
import { SingleElement } from "../../element/single";

export class CopyToClipboardInstruction extends Instruction {
	constructor(
		private element: SingleElement
	) {
		super();
	}

	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		const id = await this.element.find(page, project);
		const content = await PageParser.getElementContent(page, id);

		await PageParser.copyToClipboard(page, content);

		const step = `copied '${content}' to clipboard`;
		this.guide.push(step);

		return super.finishExecution();
	}
}