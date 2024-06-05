import { SingleElement } from "./single";
import { MultiElement } from "./multi";
import { Page } from "puppeteer";
import { Project } from "../project";

export abstract class Element {
	protected filter = (ids: string[]) => { return ids; };

	constructor(
		protected locator?: string,
		protected parent?: SingleElement,
		protected parents?: MultiElement,
		filter?: (ids: string[]) => string[],
	) {
		if (filter) {
			this.filter = filter;
		}
	}

	getLocator(): string {
		this.validateParentAssignment();
		
		let locator = '';

		if (this.parent) {
			locator = this.parent.getLocator();
		} else if (this.parents) {
			locator = this.parents.getLocator();
		}

		const divider = (this.locator && locator) ? ' > ' : '';
		const extension = this.locator ? this.locator : '';

		return `${locator}${divider}${extension}`;
	}

	private validateParentAssignment() {
		if (this.parent && this.parents) {
			throw new Error(`Elements cannot have an 'element parent' and 'elements parent'`);
		}
	}

	protected async findParentIds(page: Page, project: Project): Promise<string[]> {
		this.validateParentAssignment();

		let ids = [];

		if (this.parent) {
			ids = [await this.parent.find(page, project)];
		}

		if (this.parents) {
			this.parents.prepareConstraintSelectors(project);

			ids = await this.parents.find(page, project);
		}

		// apply element filter
		return this.filter(ids);
	}
}