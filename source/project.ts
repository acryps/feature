export class Project {
	private ignoreLocators: Set<string> = new Set();

	constructor(
		public name: string,
		public url: string
	) {}

	get ignoreSelectors(): string[] {
		const ignored = [];

		for (let ignoreLocator of this.ignoreLocators) {
			ignored.push(this.generateSelector(ignoreLocator));
		}

		return ignored;
	}

	public wrap(locatorPart: string): string[] {
		if (locatorPart === '!') {
			return ['ui-dialog'];
		}

		return [`${locatorPart}`, `ui-${locatorPart}`, `.ui-${locatorPart}`, `[ui-${locatorPart}]`, `.${locatorPart}`, `[${locatorPart}]`];
	}

	public ignore(locator: string) {
		if (locator) {
			this.ignoreLocators.add(locator);
		}
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