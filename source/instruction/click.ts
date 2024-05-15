import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { PageParser } from "../page/parser";
import { Recorder } from "../video/recorder";

export class ClickInstruction extends Instruction {
	private clickableName: string;

	private rectangle?: DOMRect;

	private horizontal: string;
	private vertical: string;

	constructor(
		private locator: string,
		private elementContent?: string,
	){
		super();
	}

	public async execute(project: Project, page: Page, recorder?: Recorder) {
		const selector = project.generateSelector(this.locator);

		const id = await PageParser.findSingle(page, selector, this.elementContent);

		if (this.elementContent) {
			this.clickableName = this.elementContent;
		} else {
			const content = await PageParser.getElementContent(page, id);
			this.clickableName = content ? content : this.locator;
		}

		this.rectangle = await PageParser.visibleBoundingRectangle(page, id);

		if (this.rectangle) {
			const viewport = await page.viewport();
			this.setPosition(this.rectangle, viewport);
		}

		await super.screenshot(page, [this.rectangle]);

		const center = {x: this.rectangle.x + (this.rectangle.width / 2), y: this.rectangle.y + (this.rectangle.height / 2)};

		if (recorder) {
			await recorder.simulateCursorMovement(center.x, center.y);
		}

		await page.mouse.click(center.x, center.y);

		await page.waitForNetworkIdle();

		const step = `click '${this.clickableName}' on the ${this.vertical} ${this.horizontal} at (${center.x.toFixed(1)}, ${center.y.toFixed(1)})`;
		this.guide.push(step);

		console.log(`[info] ${step}`);

		return {
			screenshots: this.screenshots,
			guide: this.guide
		};
	}

	private setPosition(rectangle: DOMRect, viewport: {width: number, height: number}) {
		if (rectangle.x > viewport.width / 2) {
			this.horizontal = 'right';
		} else {
			this.horizontal = 'left';
		}

		if (rectangle.y > viewport.height / 2) {
			this.vertical = 'lower';
		} else {
			this.vertical = 'upper';
		}
	}
}