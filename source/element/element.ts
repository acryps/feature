import { SingleElement } from "./single-element";
import { MultiElement } from "./multi-element";
import { Page } from "puppeteer";
import { Project } from "../project";

export abstract class Element {
	constructor(
		protected locator?: string,
		protected parent?: SingleElement,
		protected parents?: MultiElement,
	) {}

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

		if (this.parent) {
			return [await this.parent.find(page, project)];
		}

		if (this.parents) {
			this.parents.prepareConstraintSelectors(project);

			const ids = await this.parents.find(page, project);
			
			if (Array.isArray(ids)) {
				return ids;
			} else {
				return [ids];
			}
		}

		return [];
	}
}