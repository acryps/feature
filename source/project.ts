import { Instruction } from "./instruction/instruction";

export class Project {
	constructor(
		public name: string,
		public baseUrl: string
	) {}

	public wrapSelector(selector: string): string[] {
		if (selector == '!') {
			return ['ui-dialog'];
		}

		return [`${selector}`, `ui-${selector}`, `.ui-${selector}`, `[ui-${selector}]`, `.${selector}`, `[${selector}]`];
	}

	public generateSelector(locatorString: string) {
		let locators: string[] = locatorString.split(' ');

		const current = locators.shift();

		return this.selector(current, locators, '');
	}

	private selector(current: string, locators: string[], selector: string) {
		let selectors: string[] = [];

		if (current) {
			const selectorVariations = this.wrapSelector(current);

			for (let variation of selectorVariations) {
				const nextLocators = [...locators];
				const nextLocator = nextLocators.shift();

				selectors.push(this.selector(nextLocator, nextLocators, [selector, variation].join(' ')));
			}
		} else {
			return selector;
		}

		return selectors.join(', ');
	}
}
