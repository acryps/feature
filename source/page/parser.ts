import { Page } from "puppeteer";
import { Mouse } from '../mouse/mouse';
import { Identifier } from "../shared/identifier";
import { BrowserManager } from "../browser/manager";
import { SearchConstraint } from "../element/constraint";

export class PageParser {
	private static readonly timeout = 30 * 1000;

	static async findAll(page: Page, parentIds: string[], selector: string, conditions: SearchConstraint[]): Promise<string[]> {
		const ids = await page.evaluate((parentIds, selector, conditions) => {
			const generateId = () => {
				let id = '';
		
				for (let index = 0; index < 64; index++) {
					id += Math.random().toString(16)[3];
				}

				return id;
			}

			let ids: string[] = [];
			let elements: Element[] = [];

			if (parentIds.length == 0) {
				elements = [...document.querySelectorAll(selector)];
			} else {
				for (let parentId of parentIds) {
					elements.push(...window[parentId]?.querySelectorAll(selector));
				}
			}

			for (let element of elements) {
				let current = element;

				for (let condition of conditions) {
					const conditionElements = [...element.querySelectorAll(condition.selector)];

					if (!conditionElements || !conditionElements.find(locatedElement => locatedElement.textContent.toLowerCase().trim() === condition.value.toLowerCase().trim())) {
						current = null;
					}
				}

				if (current) {
					const id = generateId();
					window[id] = current;
					ids.push(id);
				}
			}

			return ids;
		}, parentIds, selector, conditions);

		return ids;
	}

	static async find(page: Page, parentIds: string[], selector: string, elementContent?: string): Promise<string> {
		const id = Identifier.get();

		const response = await page.evaluate((parentIds, selector, elementContent, id) => {
			let elements: Element[] = [];
			let assignedId: string = null;

			if (parentIds.length == 0) {
				elements = [...document.querySelectorAll(selector)];
			} else {
				for (let parentId of parentIds) {
					elements.push(...window[parentId]?.querySelectorAll(selector))
				}
			}

			if (elementContent) {
				elements = elements.filter(element => element.textContent.toLowerCase().trim() === elementContent.toLowerCase().trim());
			}

			if (elements.length > 0) {
				window[id] = elements.at(0);
				assignedId = id;
			}

			return { id: assignedId, elements: elements.length };
		}, parentIds, selector, elementContent, id);

		if (response.elements > 1) {
			throw new Error(`Found several elements for single element with selector '${selector.split(',').at(0)}, ...' (Use .elements() to handle multiple elements)`);
		}

		return response.id;
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
			let placeholder = '';

			if (element instanceof HTMLInputElement) {
				element.value = content;
				placeholder = element.placeholder;
			} else {
				element.textContent = content;
				placeholder = element.localName;
			}

			element.blur();

			return placeholder;
		}, id, content);

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

	static async readFromClipboard(page: Page) {
		await BrowserManager.overridePermissions(page, ['clipboard-read']);

		const content = await page.evaluate(async () => {
			return await navigator.clipboard.readText();
		});

		return content;
	}

	static async copyToClipboard(page: Page, content: string) {
		await BrowserManager.overridePermissions(page, ['clipboard-sanitized-write']);

		await page.evaluate(async (content) => {
			await navigator.clipboard.writeText(content);
		}, content);
	}

	static async waitWhile(page: Page, selector: string) {
		await new Promise<void>((done, reject) => {
			const timer = setTimeout(() => reject(), this.timeout);

			setTimeout(() => {
				const waiter = setInterval(async () => {
					const present = await page.evaluate((selector) => {
						return !!document.querySelector(selector);
					}, selector);
					
					if (!present) {
						clearTimeout(timer);
						clearInterval(waiter);
						
						done();
					}
				}, 5);
			}, 100);
		});

		await page.waitForNetworkIdle();
		await this.waitForUpdates(page);
	}

	static async waitForUpdates(page: Page) {
		await new Promise<void>((done, reject) => {
			const timer = setTimeout(() => reject(), this.timeout);
			
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
				}, 500);
			}, 100);
		});
	}
}