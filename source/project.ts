import { Instruction } from "./instruction/instruction";

export class Project {
	private prefixes: string[] = [''];
	private postfixes: string[] = [''];

	private keywords: { [id: string]: string; } = {}

	constructor(
		public name: string,
		public baseUrl: string
	) {}

	public customStep<T extends Instruction>(instructionType: T, customToString: (instance: T) => string) {
		instructionType.step = customToString;
	}

	public addPrefix(prefix: string) {
		this.prefixes.push(prefix);
	}

	public addPostfix(postfix: string) {
		this.postfixes.push(postfix);
	}

	public addKeyword(key: string, locator: string) {
		if (this.keywords[key]) {
			console.warn(`[warning] overwriting existing keyword pair {'${key}' : '${this.keywords[key]}'} with {'${key}' : '${locator}'}!`);
		}

		this.keywords[key] = locator;
	}

	public generateSelector(locatorString: string) {
		let locators = [];

		for (let locator of locatorString.split(' ')) {
			if (this.keywords[locator]) {
				locators.push(this.keywords[locator]);
			} else {
				locators.push(locator);
			}
		}

		const current = locators.shift();
		return this.selector(current, locators, '');
	}

	private selector(current: string, locators: string[], selector: string) {
		let selectors: string[] = [];

		if (current) {
			const selectorVariations = this.selectorVariations(current);

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

	private selectorVariations(name: string) {
		const variations = [];

		for (let prefix of this.prefixes) {
			for (let postfix of this.postfixes) {
				variations.push(`${prefix}${name}${postfix}`);
				variations.push(`.${prefix}${name}${postfix}`);
				variations.push(`[${prefix}${name}${postfix}]`);
			}
		}

		return variations;
	}
}
