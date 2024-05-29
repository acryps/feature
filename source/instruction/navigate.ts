import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";
import { Mouse } from "../mouse/mouse";
import { ExecutionConfiguration } from "../execution/configuration";

export class NavigationInstruction extends Instruction {
	private source: string;
	private rectangle?: DOMRect;

	constructor(
		private locator: string,
		private title: string,
	){
		super();
	}

	public async execute(project: Project, page: Page, mouse: Mouse, configuration: ExecutionConfiguration) {
		super.initializeExecution(configuration);

		const selector = project.generateSelector(this.locator);
		
		const id = await PageParser.findSingle(page, selector, this.title);

		this.source = await page.url();
		this.rectangle = await PageParser.visibleBoundingRectangle(page, mouse, id);
		
		await super.screenshot(project, page, [this.rectangle]);

		const center = {x: this.rectangle.x + (this.rectangle.width / 2), y: this.rectangle.y + (this.rectangle.height / 2)};
		await mouse.click(center.x, center.y);

		const step = `navigate to '${this.title}' from '${this.source}'`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return super.finishExecution();
	}
}