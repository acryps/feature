import {  Viewport } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";
import { SingleElement } from "../element/single";
import { PageInteractor } from "../page/interactor";

export class ClickInstruction extends Instruction {
	constructor(
		private element: SingleElement
	) {
		super();
	}

	async execute(project: Project, interactor: PageInteractor) {
		super.initializeExecution(interactor.configuration);

		const id = await this.element.find(interactor.scraper, project);
		let name =  this.element.getLocator();

		if (this.element.elementContent) {
			name = this.element.elementContent;
		} else {
			const content = await interactor.scraper.getElementContent(id);
			name = content ? content : name;
		}

		await interactor.mouse.scrollIntoView(id);

		const rectangle = await interactor.scraper.getBoundingRectangle(id);
		const center = { x: rectangle.x + (rectangle.width / 2), y: rectangle.y + (rectangle.height / 2) };
		const viewport = await interactor.scraper.page.viewport();
		const position = this.getPosition(rectangle, viewport);

		await super.screenshot(project, interactor.scraper, [rectangle]);

		await interactor.mouse.click(center.x, center.y);

		await super.screenshot(project, interactor.scraper, [rectangle]);

		const step = `click '${name}' on the ${position}`;
		this.guide.push(step);

		return super.finishExecution();
	}

	private getPosition(rectangle: DOMRect, viewport: Viewport): string {
		let position = '';

		const sections = 3;
		const sectionWidth = viewport.width / sections;
		const sectionHeight = viewport.height / sections;

		if (rectangle.y > sectionHeight * 2) {
			position += `lower `;
		} else if (sectionHeight < rectangle.y && rectangle.y < sectionHeight * 2) {
			position += `middle `;
		} else {
			position += `upper `;
		}

		if (rectangle.x > sectionWidth * 2) {
			position += `right`;
		} else if (sectionWidth < rectangle.x && rectangle.x < sectionWidth * 2) {
			position += `middle`;
		} else {
			position += `left`;
		}

		if (
			sectionWidth < rectangle.x && rectangle.x < sectionWidth * 2 &&
			sectionHeight < rectangle.y && rectangle.y < sectionHeight * 2
		) {
			position = 'middle';
		}

		return position;
	}
}