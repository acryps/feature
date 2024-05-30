import { Page } from "puppeteer";
import { ExecutionConfiguration } from "../../execution/configuration";
import { Step } from "../../execution/step";
import { Mouse } from "../../mouse/mouse";
import { Project } from "../../project";
import { Instruction } from "../instruction";
import { PageParser } from "../../page/parser";
import { ClipboardManager } from "../../utilities/clipboard";

export class CopyToClipboardInstruction extends Instruction {
	constructor(
		private locator: string,
		private clipboardId: string
	) {
		super();
	}

	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		const selector = project.generateSelector(this.locator);
		const id = await PageParser.findSingle(page, selector);

		const content = await PageParser.getElementContent(page, id);

		ClipboardManager.write(this.clipboardId, content);

		const step = `copied '${content}' to clipboard`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return super.finishExecution();
	}
}