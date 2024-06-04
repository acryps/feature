import { Single } from "./single";
import { Multiple } from "./multiple";
import { Page } from "puppeteer";
import { Project } from "../project";

export abstract class Element {
	constructor(
		protected locator?: string,
		protected parent?: Single,
		protected parents?: Multiple,
	) {}

	getLocator(): string {
		this.check();
		
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

	private check() {
		if (this.parent && this.parents) {
			throw new Error(`elements cannot have an 'element parent' and 'elements parent'`);
		}
	}

	protected async parentIds(page: Page, project: Project): Promise<string[]> {
		this.check();

		if (this.parent) {
			return [await this.parent.find(page, project)];
		}

		if (this.parents) {
			this.parents.prepareConditions(project);

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