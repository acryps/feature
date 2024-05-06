import { Page } from "puppeteer";

export class PageParser {
	static async findElementsContent(page: Page, htmlTags: string[], valueTags: string[]) {
		const elementContents = await page.$$eval(htmlTags.join(' '), (elements, valueTags) => {
			const items = [];

			for (let element of elements) {
				if (valueTags) {
					let elementValues = [];

					for (let valueTag of valueTags) {
						const values = element.querySelectorAll(valueTag);

						for (let value of values) {
							elementValues.push(value.textContent);
						}
					}

					items.push(elementValues.join(' '));
				} else {
					items.push(element.textContent);
				}
			}

			return items;
		}, valueTags);

		return elementContents
	}

	static async findElementContent(page: Page, htmlTags: string[]) {
		await this.checkIfSingleElement(page, htmlTags);

		const elementContent = await page.$$eval(htmlTags.join(' '), elements => {
			for (let element of elements) {
				return element.textContent;
			}
		});

		return elementContent
	}

	static async fillInput(content: string, page: Page, htmlTags: string[]) {
		await this.checkIfSingleElement(page, htmlTags);

		await page.focus(htmlTags.join(' '));
		await page.keyboard.type(content);

		const placeholder = await page.$eval(htmlTags.join(' '), element => {
			if (element instanceof HTMLInputElement) {
				return element.placeholder;
			}
		});

		return placeholder;
	}

	static async getCoordinatesOfElement(page: Page, htmlTags: string[], elementContent?: string): Promise<{x: number, y: number}> {
		await this.checkIfSingleElement(page, htmlTags, elementContent);

		let coordinates: {x: number, y: number};
		
		coordinates = await page.$$eval(htmlTags.join(' '), (elements, content) => {
			// filter according to text content
			if (content) {
				elements = elements.filter(element => element.textContent.toLowerCase() === content.toLowerCase());
			}

			for (let element of elements) {

				const boundingBox = element.getBoundingClientRect();

				return {x: boundingBox.x, y: boundingBox.y}
			}
		}, elementContent);

		return coordinates;
	}

	static async countElements(page: Page, htmlTags: string[], elementContent?: string) {
		return await page.$$eval(htmlTags.join(' '), (elements, content) => {
			if (content) {
				return elements.filter(element => element.textContent.toLowerCase() === content.toLowerCase()).length;
			} else {
				return elements.length;
			}
		}, elementContent);
	}

	static async getViewport(page: Page, htmlTag: string[]): Promise<{width: number, height: number}> {
		return await page.viewport();
	}

	static async clickElement(page: Page, htmlTags: string[], elementContent?: string) {
		await this.checkIfSingleElement(page, htmlTags, elementContent);
		
		const successful = await page.evaluate((htmlTags, content) => {
			let elements = [...document.querySelectorAll(htmlTags.join(' '))];

			if (content) {
				elements = elements.filter(element => element.textContent.toLowerCase() === content.toLowerCase());
			}
			
			for (let element of elements) {
				if (element instanceof HTMLElement) {
					element.click();
					return true;
				}
			}

			return false;
		}, htmlTags, elementContent);

		return successful;
	}

	static async checkIfSingleElement(page: Page, htmlTags: string[], elementContent?: string): Promise<void> {
		const elements = await this.countElements(page, htmlTags, elementContent);

		if (elements > 1) {
			console.warn(`[warning] several elements match '${htmlTags.join(' ')}${elementContent ? ` "${elementContent}"` : ''}'! Currently, the first one is used.`);
		} else if (elements == 0) {
			console.warn(`[warning] no elements match '${htmlTags.join(' ')}${elementContent ? ` "${elementContent}"` : ''}'!`);
		}
	}
}