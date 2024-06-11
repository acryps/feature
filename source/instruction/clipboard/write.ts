import { ExecutionConfiguration } from "../../execution/configuration";
import { Step } from "../../execution/step/step";
import { Mouse } from "../../mouse/mouse";
import { Project } from "../../project";
import { Instruction } from "../instruction";
import { PageScraper } from "../../page/scraper";
import { SingleElement } from "../../element/single";

export class WriteFromClipboardInstruction extends Instruction {
	private fieldName: string;
	private rectangle?: DOMRect;

	private content: string;

	constructor(
		private element: SingleElement
	) {
		super();
	}

	async execute(project: Project, scraper: PageScraper, mouse: Mouse, configuration: ExecutionConfiguration): Promise<Step> {
		super.initializeExecution(configuration);

		const id = await this.element.find(scraper, project);

		await mouse.scrollIntoView(id);
		this.rectangle = await scraper.getBoundingRectangle(id);

		const center = { x: this.rectangle.x + (this.rectangle.width / 2), y: this.rectangle.y + (this.rectangle.height / 2) };
		await mouse.hover(center.x, center.y);

		this.content = await scraper.readFromClipboard();
		this.fieldName = await scraper.inputContent(id, this.content);

		await scraper.waitForUpdates();

		await super.screenshot(project, scraper, [this.rectangle]);

		const step = `write '${this.content}' from clipboard in '${this.fieldName}' field`;
		this.guide.push(step);

		return super.finishExecution();
	}
}