export class Project {
	constructor(
		public name: string,
		public url: string
	) {}

	public wrap(locatorPart: string): string[] {
		if (locatorPart === '!') {
			return ['ui-dialog'];
		}

		return [`${locatorPart}`, `ui-${locatorPart}`, `.ui-${locatorPart}`, `[ui-${locatorPart}]`, `.${locatorPart}`, `[${locatorPart}]`];
	}

	public generateSelector(locator: string) {
		const locatorParts = locator.split(' ');
		const locatorPart = locatorParts.shift();

		return this.selector(locatorPart, locatorParts, '');
	}

	private selector(locatorPart: string, locatorParts: string[], selector: string): string {
		const selectors: string[] = [];

		if (locatorPart) {
			const selectorVariations = this.wrap(locatorPart);

			for (let selectorVariation of selectorVariations) {
				const remainingLocatorParts = [...locatorParts];
				const nextLocatorPart = remainingLocatorParts.shift();

				selectors.push(this.selector(nextLocatorPart, remainingLocatorParts, [selector, selectorVariation].join(' ')));
			}
		} else {
			return selector;
		}

		return selectors.join(', ');
	}
}