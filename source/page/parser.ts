import { Page } from "puppeteer";

export class PageParser {
	static async findSingle(page: Page, selector: string, elementContent?: string): Promise<string> {
		const id = this.generateId();

		const response = await page.evaluate((selector, content, id) => {
			let elements = [...document.querySelectorAll(selector)];

			if (content) {
				elements = elements.filter(element => element.textContent.toLowerCase() === content.toLowerCase());
			}
			
			for (let element of elements) {
				window[id] = element;

				return {id: id, elements: elements.length};
			}

			return {id: id, elements: elements.length};
		}, selector, elementContent, id);

		if (response.elements > 1) {
			console.warn(`[warning] several elements match '${selector.split(',')[0]}${elementContent ? ` "${elementContent}"` : ''}'! Currently, the first one is used.`);
		} else if (response.elements == 0) {
			throw new Error(`[error] no elements match '${selector.split(',')[0]}${elementContent ? ` "${elementContent}"` : ''}'!`);
		}

		return response.id;
	}

	static async findMultiple(page: Page, selector: string, elementContent?: string): Promise<string[]> {
		const ids = await page.evaluate((selector, content) => {
			const generateId = () => {
				let id = '';
		
				for (let index = 0; index < 64; index++) {
					id += Math.random().toString(16)[3];
				}

				return id;
			}

			let elements = [...document.querySelectorAll(selector)];
			
			const ids: string[] = [];

			if (content) {
				elements = elements.filter(element => element.textContent.toLowerCase() === content.toLowerCase());
			}
			
			for (let element of elements) {
				const id = generateId();
				window[id] = element;
				
				ids.push(id);
			}

			return ids;
		}, selector, elementContent);

		if (ids.length == 0) {
			throw new Error(`[error] no elements match '${selector.split(',')[0]}${elementContent ? ` "${elementContent}"` : ''}'!`);
		}

		return ids;
	}

	static async getBoundingRectangle(page: Page, id: string): Promise<DOMRect> {
		const rectangle = await page.evaluate((id) => {
			const element = window[id];

			const rectangle: DOMRect = element.getBoundingClientRect();

			return JSON.stringify(rectangle);
		}, id);

		return JSON.parse(rectangle) as DOMRect;
	}

	static async getBoundingRectangles(page: Page, ids: string[]): Promise<DOMRect[]> {
		const rectangles = await page.evaluate((ids) => {
			const rectangles = [];

			for (let id of ids) {
				const element = window[id];

				const rectangle: DOMRect = element.getBoundingClientRect();
	
				rectangles.push(JSON.stringify(rectangle));
			}

			return rectangles;
		}, ids);

		return rectangles.map(rectangle => JSON.parse(rectangle) as DOMRect);
	}

	static async getElementContent(page: Page, id: string): Promise<string> {
		return await page.evaluate((id) => {
			const element: HTMLElement = window[id];

			return element.textContent;
		}, id);
	}

	static async inputContent(page: Page, id: string, content: string): Promise<string> {
		const placeholder = await page.evaluate((id, content) => {
			const element = window[id];

			if (element instanceof HTMLInputElement) {
				element.value = content;

				element.blur();

				return element.placeholder;
			}
		}, id, content);

		if (!placeholder) {
			throw new Error(`[error] could not find input element!`);
		}

		return placeholder;
	}

	static async getElementsContent(page: Page, ids: string[], valueSelectors: string[]): Promise<string[]> {
		const elementsContent = await page.evaluate((ids, valueSelectors) => {
			const elementsContent: string[] = [];

			for (let id of ids) {
				const element = window[id];
				const elementValues: string[] = [];

				for (let valueSelector of valueSelectors) {
					const values = element.querySelectorAll(valueSelector);

					for (let value of values) {
						elementValues.push(value.textContent);
					}
				}

				elementsContent.push(elementValues.join(', '));
			}

			return elementsContent;
		}, ids, valueSelectors);

		return elementsContent;
	}

	static async visibleBoundingRectangle(page: Page, id: string): Promise<DOMRect> {
		const viewport = await page.viewport();
		const rectangle = await this.getBoundingRectangle(page, id);

		const visible = rectangle 
			&& rectangle.x >= 0 && rectangle.y >= 0
			&& (rectangle.x + rectangle.width) <= viewport.width
			&& (rectangle.y + rectangle.height) <= viewport.height;

		if (!visible) {
			await page.evaluate((id) => {
				const element: HTMLElement = window[id];

				element.scrollIntoView({
					block: 'center',
					inline: 'center',
					// behavior: 'smooth' // todo: for video
				});
			}, id);

			return await this.getBoundingRectangle(page, id);
		}

		return rectangle;
	}

	private static generateId(): string {
		let id = '';
		
		for (let index = 0; index < 64; index++) {
			id += Math.random().toString(16)[3];
		}
		
		return id;
	}
}