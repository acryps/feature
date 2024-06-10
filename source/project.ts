export class Project {
	private ignoredLocators: Set<string>;

	constructor(
		public name: string,
		public url: string
	) {
		this.ignoredLocators = new Set();
	}

	get ignoredSelectors(): string[] {
		const ignored: string[] = [];

		for (let ignoredLocator of this.ignoredLocators) {
			ignored.push(this.generateSelector(ignoredLocator));
		}

		return ignored;
	}

	wrap(locatorPart: string): string[] {
		if (locatorPart === '!') {
			return ['ui-dialog'];
		}

		return [`${locatorPart}`, `ui-${locatorPart}`, `.ui-${locatorPart}`, `[ui-${locatorPart}]`, `.${locatorPart}`, `[${locatorPart}]`];
	}

	ignore(locator: string) {
		if (locator) {
			this.ignoredLocators.add(locator);
		}
	}

	generateSelector(locator: string): string {
		const locatorParts = locator.split(' ');
		const locatorPart = locatorParts.shift();

		return this.assembleSelector(locatorPart, locatorParts, '');
	}

	private assembleSelector(locatorPart: string, locatorParts: string[], selector: string): string {
		const selectors: string[] = [];

		if (locatorPart) {
			const selectorVariations = this.wrap(locatorPart);

			for (let selectorVariation of selectorVariations) {
				const remainingLocatorParts = [...locatorParts];
				const nextLocatorPart = remainingLocatorParts.shift();

				selectors.push(this.assembleSelector(nextLocatorPart, remainingLocatorParts, [selector, selectorVariation].filter(element => !!element).join(' ')));
			}
		} else {
			return selector;
		}

		return selectors.join(', ');
	}
}