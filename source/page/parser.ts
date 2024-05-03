import { Page } from "puppeteer";

export class PageParser {
	static async findElementsContent(page: Page, htmlTags: string[]) {
		const elementContents = await page.$$eval(htmlTags.join(' '), elements => {
			const items = [];

			for (let element of elements) {
				items.push(element.textContent);
			}

			return items;
		});

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

		const inputPlaceholder = await page.$$eval(htmlTags.join(' '), (elements, content) => {
			for (let element of elements) {
				if (element instanceof HTMLInputElement) {
					// set content
					element.value = content;

					// return placeholder
					return element.placeholder;
				}
			}
		}, content);

		return inputPlaceholder;
	}

	static async getCoordinatesOfElement(page: Page, htmlTags: string[]): Promise<{x: number, y: number}> {
		await this.checkIfSingleElement(page, htmlTags);

		let coordinates: {x: number, y: number};
		
		coordinates = await page.$$eval(htmlTags.join(' '), elements => {
			for (let element of elements) {
				const boundingBox = element.getBoundingClientRect();

				return {x: boundingBox.x, y: boundingBox.y}
			}
		});

		return coordinates;
	}

	static async countElements(page: Page, htmlTags: string[], content?: string) {
		return await page.$$eval(htmlTags.join(' '), (elements, content) => {
			if (content) {
				return elements.filter(element => element.textContent.toLowerCase() === content.toLowerCase()).length;
			} else {
				return elements.length;
			}
		}, content);
	}

	static async getViewport(page: Page, htmlTag: string[]): Promise<{width: number, height: number}> {
		return await page.viewport();
	}

	static async clickElementByTags(page: Page, htmlTags: string[]) {
		await this.checkIfSingleElement(page, htmlTags);
		await page.click(htmlTags.join(' '));
	}

	static async clickElementByContent(page: Page, htmlTags: string[], content: string) {
		await this.checkIfSingleElement(page, htmlTags, content);
		
		const successful = await page.evaluate((htmlTags, content) => {
			const element = [...document.querySelectorAll(htmlTags.join(' '))].find(element => element.textContent.toLowerCase() === content.toLowerCase());
			
			if (element instanceof HTMLElement) {
				element.click();
				return true;
			}

			return false;
		}, htmlTags, content);

		return successful;
	}

	static async checkIfSingleElement(page: Page, htmlTags: string[], content?: string): Promise<void> {
		const elements = await this.countElements(page, htmlTags, content);

		if (elements > 1) {
			console.warn(`[warning] several elements match '${htmlTags.join(' ')}'! Currently, the first one is used.`);
		} else if (elements == 0) {
			console.warn(`[warning] no elements match '${htmlTags.join(' ')}'!`);
		}
	}
}