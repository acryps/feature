import { Page } from "puppeteer";
import { Mouse } from '../mouse/mouse';

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
			console.warn(`[warning] several elements match '${selector.split(',')[0]}${elementContent ? `"${elementContent}"` : ''}'! The first one is used.`);
		} else if (response.elements == 0) {
			console.warn(`[warning] no elements match '${selector.split(',')[0]}${elementContent ? `"${elementContent}"` : ''}'!`);
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
			const rectangles: string[] = [];

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
				const element: Element = window[id];
				const elementValues: string[] = [];

				for (let valueSelector of valueSelectors) {
					const valueElements = element.querySelectorAll(valueSelector);

					for (let valueElement of valueElements) {
						elementValues.push(valueElement.textContent);
					}
				}

				elementsContent.push(elementValues.join(', '));
			}

			return elementsContent;
		}, ids, valueSelectors);

		return elementsContent;
	}

	static async visibleBoundingRectangle(page: Page, mouse: Mouse, id: string): Promise<DOMRect> {
		const viewport = await page.viewport();
		const rectangle = await this.getBoundingRectangle(page, id);

		const visible = rectangle 
			&& rectangle.x >= 0 && rectangle.y >= 0
			&& (rectangle.x + rectangle.width) <= viewport.width
			&& (rectangle.y + rectangle.height) <= viewport.height;

		if (!visible) {
			await mouse.scrollIntoView(page, id);

			return await this.getBoundingRectangle(page, id);
		}

		return rectangle;
	}

	// set timer to wait for changes on the page
	static async waitForUpdates(page: Page) {
		// wait for no changes on the page
		await new Promise<void>((done, reject) => {
			// timeout
			const timer = setTimeout(() => reject(), 30 * 1000);
			
			// wait for initial load
			setTimeout(() => {
				let content: string;
				
				const waiter = setInterval(async () => {
					const updated = await page.evaluate(() => document.body.innerHTML);
					
					if (updated == content) {
						clearTimeout(timer);
						clearInterval(waiter);
						
						done();
					} else {
						content = updated;
					}
				}, 250);
			}, 100);
		});
	}

	private static generateId(): string {
		let id = '';
		
		for (let index = 0; index < 64; index++) {
			id += Math.random().toString(16)[3];
		}
		
		return id;
	}
}