import { Page } from "puppeteer";
import { Feature } from "../feature";
import { ClickInstruction } from "../instruction/click";
import { Project } from "../project";
import { Multiple } from "./multiple";
import { Element } from "./element";
import { PageParser } from "../page/parser";
import { HoverInstruction } from "../instruction/hover";
import { ScrollToInstruction } from "../instruction/scroll-to";
import { WriteInstruction } from "../instruction/write";
import { CopyToClipboardInstruction } from "../instruction/copy-to";
import { WriteFromClipboardInstruction } from "../instruction/write-from";
import { ShowInstruction } from "../instruction/show";

export class Single extends Element {
	private id?: string;

	constructor(
		private feature: Feature,
		locator?: string,
		public readonly elementContent?: string,
		parent?: Single,
		parents?: Multiple
	) {
		super(locator, parent, parents);
	}

	async find(page: Page, project: Project): Promise<string> {
		const ids = await super.parentIds(page, project);

		if (this.locator) {
			const selector = project.generateSelector(this.locator);
			this.id = await PageParser.find(page, ids, selector, this.elementContent);
		} else {
			if (ids.length > 1) {
				throw new Error(`found several items for single element`);
			} else if (ids.length == 0) {
				throw new Error(`found no element`);
			} else {
				this.id = ids.at(0);
			}
		}

		return this.id;
	}

	element(locator: string, elementContent?: string): Single {
		return new Single(this.feature, locator, elementContent, this, null);
	}

	elements(locator: string): Multiple {
		return new Multiple(this.feature, locator, this, null);
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