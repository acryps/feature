import { Instruction } from "./instruction/instruction";

export class Project {
	private prefixes: string[] = [''];
	private postfixes: string[] = [''];

	constructor(
		public baseUrl
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

	public generateSelector(locator: string) {
		const locators = locator.split(' ');

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
