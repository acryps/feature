import { Page } from "puppeteer";
import { Feature } from "../feature";
import { Project } from "../project";
import { Condition } from "./condition";
import { Element } from './element';
import { PageParser } from "../page/parser";
import { Single } from "./single";
import { ShowInstruction } from "../instruction/show";

export class Multiple extends Element {
	private ids?: string[];

	private conditions: Condition[];
	private filter: () => string | string[];

	constructor(
		private feature: Feature,
		locator?: string,
		parent?: Single,
		parents?: Multiple
	) {
		super(locator, parent, parents); 

		this.conditions = [];

		this.filter = () => {
			return this.ids;
		}
	}

	async find(page: Page, project: Project): Promise<string | string[]> {
		const ids = await super.parentIds(page, project);

		if (this.locator) {
			const selector = project.generateSelector(this.locator);
			this.ids = await PageParser.findAll(page, ids, selector, this.conditions);
		} else {
			this.ids = ids;
		}

		return this.filter();
	}

	elements(locator: string): Multiple {
		return new Multiple(this.feature, locator, null, this);
	}

	show(valueTags: string[]): Feature {
		const instruction = new ShowInstruction(this, valueTags);
		this.feature.addInstruction(instruction, this);

		return this.feature;
	}

	where(locator: string, value: string): Multiple {
		this.conditions.push({ locator: locator, value: value });

		return this;
	}

	first(): Single {
		this.filter = () => {
			return this.ids.at(0);
		}
		
		return new Single(this.feature, null, null, null, this);
	}
	
	last(): Single {
		this.filter = () => {
			return this.ids.at(-1);
		}
		
		return new Single(this.feature, null, null, null, this);
	}
	
	get(index: number): Single {
		this.filter = () => {
			return this.ids.at(index);
		}
		
		return new Single(this.feature, null, null, null, this);
	}
	
	range(start: number, end: number): Multiple {
		this.filter = () => {
			return this.ids.slice(start, end);
		}
		
		return new Multiple(this.feature, null, null, this);
	}

	prepareConditions(project: Project) {
		for (let condition of this.conditions) {
			condition.selector = project.generateSelector(condition.locator);
		}
	}
}