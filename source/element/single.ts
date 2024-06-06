import { Page } from "puppeteer";
import { Feature } from "../feature";
import { ClickInstruction } from "../instruction/click";
import { Project } from "../project";
import { MultiElement } from "./multi";
import { Element } from "./element";
import { PageParser } from "../page/parser";
import { HoverInstruction } from "../instruction/hover";
import { ScrollToInstruction } from "../instruction/scroll";
import { WriteInstruction } from "../instruction/write";
import { CopyToClipboardInstruction } from "../instruction/clipboard/copy";
import { WriteFromClipboardInstruction } from "../instruction/clipboard/write";
import { ShowInstruction } from "../instruction/show";
import { SelectElement } from "./select";

export class SingleElement extends Element {
	private id?: string;

	constructor(
		readonly feature: Feature,
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

	use(callback: (element: SingleElement) => void): Feature {
		callback(this);

		return this.feature;
	}

	element(locator: string, elementContent?: string): SingleElement {
		return new SingleElement(this.feature, locator, elementContent, this, null);
	}

	elements(locator: string): MultiElement {
		return new MultiElement(this.feature, locator, this, null);
	}
 
	click(): Feature {
		this.feature.addInstruction(new ClickInstruction(this));

		return this.feature;
	}

	hover(): Feature {
		this.feature.addInstruction(new HoverInstruction(this));

		return this.feature;
	}

	scrollTo(): Feature {
		this.feature.addInstruction(new ScrollToInstruction(this));

		return this.feature;
	}

	show(valueTags?: string[]): Feature {
		this.feature.addInstruction(new ShowInstruction(this, valueTags));

		return this.feature;
	}

	write(content: string): Feature {
		this.feature.addInstruction(new WriteInstruction(this, content));

		return this.feature;
	}

	copyToClipboard(): Feature {
		this.feature.addInstruction(new CopyToClipboardInstruction(this));

		return this.feature;
	}

	writeFromClipboard(): Feature {
		this.feature.addInstruction(new WriteFromClipboardInstruction(this));

		return this.feature;
	}
	
	select(): SelectElement {
		return new SelectElement(this);
	}
}