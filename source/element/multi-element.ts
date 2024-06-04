import { Page } from "puppeteer";
import { Feature } from "../feature";
import { Project } from "../project";
import { SelectorConstraint as SearchConstraint } from "./search-constraint";
import { Element } from './element';
import { PageParser } from "../page/parser";
import { SingleElement } from "./single-element";
import { ShowInstruction } from "../instruction/show";

export class MultiElement extends Element {
	private ids?: string[];

	private searchConstraints: SearchConstraint[];
	private filter: () => string | string[];

	constructor(
		private feature: Feature,
		locator?: string,
		parent?: SingleElement,
		parents?: MultiElement
	) {
		super(locator, parent, parents); 

		this.searchConstraints = [];

		this.filter = () => {
			return this.ids;
		}
	}

	async find(page: Page, project: Project): Promise<string | string[]> {
		const ids = await super.findParentIds(page, project);

		if (this.locator) {
			const selector = project.generateSelector(this.locator);
			this.ids = await PageParser.findAll(page, ids, selector, this.searchConstraints);
		} else {
			this.ids = ids;
		}

		return this.filter();
	}

	elements(locator: string): MultiElement {
		return new MultiElement(this.feature, locator, null, this);
	}

	show(valueTags: string[]): Feature {
		const instruction = new ShowInstruction(this, valueTags);
		this.feature.addInstruction(instruction, this);

		return this.feature;
	}

	where(locator: string, value: string): MultiElement {
		this.searchConstraints.push({ locator: locator, value: value });

		return this;
	}

	first(): SingleElement {
		this.filter = () => {
			return this.ids.at(0);
		}
		
		return new SingleElement(this.feature, null, null, null, this);
	}
	
	last(): SingleElement {
		this.filter = () => {
			return this.ids.at(-1);
		}
		
		return new SingleElement(this.feature, null, null, null, this);
	}
	
	get(index: number): SingleElement {
		this.filter = () => {
			return this.ids.at(index);
		}
		
		return new SingleElement(this.feature, null, null, null, this);
	}
	
	range(start: number, end: number): MultiElement {
		this.filter = () => {
			return this.ids.slice(start, end);
		}
		
		return new MultiElement(this.feature, null, null, this);
	}

	prepareConstraintSelectors(project: Project) {
		for (let condition of this.searchConstraints) {
			condition.selector = project.generateSelector(condition.locator);
		}
	}
}