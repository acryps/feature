import { Page } from "puppeteer";
import { ExecutionConfiguration } from "../../execution/configuration";
import { Step } from "../../execution/step";
import { Mouse } from "../../mouse/mouse";
import { Project } from "../../project";
import { Instruction } from "../instruction";
import { PageParser } from "../../page/parser";
import { ClipboardManager } from "../../utilities/clipboard";

export class WriteFromClipboardInstruction extends Instruction {
	private fieldName: string;
	private rectangle?: DOMRect;

	private content: string;

	constructor(
		private locator: string,
		private clipboardId: string,
	) {
		super();
	}

	async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		const selector = project.generateSelector(this.locator);
		const id = await PageParser.findSingle(page, selector);

		this.rectangle = await PageParser.visibleBoundingRectangle(page, mouse, id);

		const center = { x: this.rectangle.x + (this.rectangle.width / 2), y: this.rectangle.y + (this.rectangle.height / 2) };
		await mouse.click(center.x, center.y);

		this.content = ClipboardManager.read(this.clipboardId);

		this.fieldName = await PageParser.inputContent(page, id, this.content);

		await PageParser.waitForUpdates(page);

		await super.screenshot(project, page, [this.rectangle]);

		const step = `write '${this.content}' from clipboard in '${this.fieldName}' field`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return super.finishExecution();
	}
}