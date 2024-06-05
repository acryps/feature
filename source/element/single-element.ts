import { Page } from "puppeteer";
import { Feature } from "../feature";
import { ClickInstruction } from "../instruction/click";
import { Project } from "../project";
import { MultiElement } from "./multi-element";
import { Element } from "./element";
import { PageParser } from "../page/parser";
import { HoverInstruction } from "../instruction/hover";
import { ScrollToInstruction } from "../instruction/scroll-to";
import { WriteInstruction } from "../instruction/write";
import { CopyToClipboardInstruction } from "../instruction/clipboard/copy-to";
import { WriteFromClipboardInstruction } from "../instruction/clipboard/write-from";
import { ShowInstruction } from "../instruction/show";

export class SingleElement extends Element {
	private id?: string;

	constructor(
		private feature: Feature,
		locator?: string,
		public readonly elementContent?: string,
		parent?: SingleElement,
		parents?: MultiElement,
		filter?: (ids: string[]) => string[],
	) {
		super(locator, parent, parents, filter);
	}

	async find(page: Page, project: Project): Promise<string> {
		const ids = await super.findParentIds(page, project);

		if (this.locator) {
			const selector = project.generateSelector(this.locator);
			this.id = await PageParser.find(page, ids, selector, this.elementContent);
		} else {
			if (ids.length > 1) {
				throw new Error(`Found several items for single element`);
			} else if (ids.length == 0) {
				throw new Error(`Found no element`);
			} else {
				this.id = ids.at(0);
			}
		}

		return this.id;
	}

	element(locator: string, elementContent?: string): SingleElement {
		return new SingleElement(this.feature, locator, elementContent, this, null);
	}

	elements(locator: string): MultiElement {
		return new MultiElement(this.feature, locator, this, null);
	}
 
	click(): Feature {
		const instruction = new ClickInstruction(this);
		this.feature.addInstruction(instruction, this);

		return this.feature;
	}

	hover(): Feature {
		const instruction = new HoverInstruction(this);
		this.feature.addInstruction(instruction, this);

		return this.feature;
	}

	scrollTo(): Feature {
		const instruction = new ScrollToInstruction(this);
		this.feature.addInstruction(instruction, this);

		return this.feature;
	}

	show(valueTags?: string[]): Feature {
		const instruction = new ShowInstruction(this, valueTags);
		this.feature.addInstruction(instruction, this);

		return this.feature;
	}

	write(content: string): Feature {
		const instruction = new WriteInstruction(this, content);
		this.feature.addInstruction(instruction, this);

		return this.feature;
	}

	copyToClipboard(): Feature {
		const instruction = new CopyToClipboardInstruction(this);
		this.feature.addInstruction(instruction, this);

		return this.feature;
	}

	writeFromClipboard(): Feature {
		const instruction = new WriteFromClipboardInstruction(this);
		this.feature.addInstruction(instruction, this);

		return this.feature;
	}
}