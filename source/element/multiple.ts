import { Page } from "puppeteer";
import { Feature } from "../feature";
import { Project } from "../project";
import { SearchConstraint } from "./constraint";
import { Element } from './element';
import { PageParser } from "../page/parser";
import { SingleElement } from "./single";
import { ShowInstruction } from "../instruction/show";

export class MultipleElement extends Element {
	private ids?: string[];

	private searchConstraints: SearchConstraint[];

	private childFilter = (ids: string[]) => { return ids; };

	constructor(
		private feature: Feature,
		locator?: string,
		parent?: SingleElement,
		parents?: MultipleElement,
		filter?: (ids: string[]) => string[],
	) {
		super(locator, parent, parents, filter); 

		this.searchConstraints = [];
	}

	async find(page: Page, project: Project): Promise<string[]> {
		const ids = await super.findParentIds(page, project);

		if (this.locator) {
			const selector = project.generateSelector(this.locator);
			this.ids = await PageParser.findAll(page, ids, selector, this.searchConstraints);
		} else {
			this.ids = ids;
		}

		return this.ids;
	}

	elements(locator: string): MultipleElement {
		return new MultipleElement(this.feature, locator, null, this, this.childFilter);
	}

	use(callback: (elements: MultipleElement) => void): Feature {
		callback(this);

		return this.feature;
	}

	show(valueTags: string[]): Feature {
		this.feature.addInstruction(new ShowInstruction(this, valueTags));

		return this.feature;
	}

	where(locator: string, value: string): MultipleElement {
		this.searchConstraints.push({ locator: locator, value: value });

		return this;
	}

	first(): SingleElement {
		this.childFilter = (ids: string[]) => {
			return [ids.at(0)];
		}
		
		return new SingleElement(this.feature, null, null, null, this, this.childFilter);
	}
	
	last(): SingleElement {
		this.childFilter = (ids: string[]) => {
			return [ids.at(-1)];
		}
		
		return new SingleElement(this.feature, null, null, null, this, this.childFilter);
	}
	
	at(index: number): SingleElement {
		this.childFilter = (ids: string[]) => {
			return [ids.at(index)];
		}
		
		return new SingleElement(this.feature, null, null, null, this, this.childFilter);
	}
	
	slice(start: number, end: number): MultipleElement {
		if (start < 0 || start > end || start === end) {
			let hint = '';

			if (start === end) {
				hint = ' (it must contain at least one value)';
			}

			throw new Error(`The slice (${start}, ${end}) is invalid${hint}`);
		}

		this.childFilter = (ids: string[]) => {
			return ids.slice(start, end);
		}
		
		return new MultipleElement(this.feature, null, null, this, this.childFilter);
	}

	prepareConstraintSelectors(project: Project) {
		for (let condition of this.searchConstraints) {
			condition.selector = project.generateSelector(condition.locator);
		}
	}
}