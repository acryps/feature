import { Page } from "puppeteer";

export class PageParser {
	static async findElementsContent(page: Page, selector: string, valueTags: string[]) {
		const elementContents = await page.$$eval(selector, (elements, valueTags) => {
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

					items.push(elementValues.join(', '));
				} else {
					items.push(element.textContent);
				}
			}

			return items;
		}, valueTags);

		return elementContents
	}

	static async findElementContent(page: Page, selector: string) {
		await this.checkIfSingleElement(page, selector);

		const elementContent = await page.$$eval(selector, elements => {
			for (let element of elements) {
				return element.textContent;
			}
		});

		return elementContent
	}

	static async fillInput(content: string, page: Page, selector: string) {
		await this.checkIfSingleElement(page, selector);

		await page.focus(selector);
		await page.keyboard.type(content);

		const placeholder = await page.$eval(selector, element => {
			if (element instanceof HTMLInputElement) {
				element.blur();
				return element.placeholder;
			}
		});

		return placeholder;
	}

	static async getCoordinatesOfElement(page: Page, selector: string, elementContent?: string): Promise<{x: number, y: number}> {
		await this.checkIfSingleElement(page, selector, elementContent);

		let coordinates: {x: number, y: number};
		
		coordinates = await page.$$eval(selector, (elements, content) => {
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

	static async countElements(page: Page, selector: string, elementContent?: string) {
		const count = await page.$$eval(selector, (elements, content) => {
			if (content) {
				return elements.filter(element => element.textContent.toLowerCase() === content.toLowerCase()).length;
			} else {
				return elements.length;
			}
		}, elementContent);

		return count;
	}

	static async getViewport(page: Page): Promise<{width: number, height: number}> {
		return await page.viewport();
	}

	static async clickElement(page: Page, selector: string, elementContent?: string) {
		await this.checkIfSingleElement(page, selector, elementContent);
		
		const successful = await page.evaluate((selector, content) => {
			let elements = [...document.querySelectorAll(selector)];

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
		}, selector, elementContent);

		return successful;
	}

	static async highlightElement(page: Page, selector: string, elementContent?: string) {
		await this.checkIfSingleElement(page, selector, elementContent);
		
		const successful = await page.evaluate((selector, content) => {
			let elements = [...document.querySelectorAll(selector)];

			if (content) {
				elements = elements.filter(element => element.textContent.toLowerCase() === content.toLowerCase());
			}
			
			for (let element of elements) {
				if (element instanceof HTMLElement) {
					element.style.border = '5px solid red';
					return true;
				}
			}

			return false;
		}, selector, elementContent);

		return successful;
	}

	static async checkIfSingleElement(page: Page, selector: string, elementContent?: string): Promise<void> {
		const elements = await this.countElements(page, selector, elementContent);

		if (elements > 1) {
			console.warn(`[warning] several elements match '${selector.substring(0, 100)}${elementContent ? ` "${elementContent}"` : ''}'! Currently, the first one is used.`);
		} else if (elements == 0) {
			console.warn(`[warning] no elements match '${selector.substring(0, 100)}${elementContent ? ` "${elementContent}"` : ''}'!`);
		}
	}
}