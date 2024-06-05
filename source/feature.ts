import { Instruction } from "./instruction/instruction";
import { GoInstruction } from "./instruction/go";
import { WaitForInstruction } from "./instruction/wait-for";
import { WaitWhileInstruction } from "./instruction/wait-while";
import { SingleElement } from "./element/single-element";
import { MultiElement } from "./element/multi-element";
import { Execution } from "./execution/execution";
import { Project } from "./project";
import { Viewport } from "puppeteer";
import { PrepareInstruction } from "./instruction/prepare";

export class Feature {
	instructions: Instruction[];

	constructor(
		public name: string,
		public description: string,
	) {
		this.instructions = [];
	}

	element(locator: string, elementContent?: string): SingleElement {
		return new SingleElement(this, locator, elementContent, null, null);
	}

	elements(locator: string): MultiElement {
		return new MultiElement(this, locator, null, null);
	}

	prepare(feature: Feature): Feature {
		this.instructions.push(new PrepareInstruction(feature));

		return this;
	}

	go(url: string): Feature {
		this.instructions.push(new GoInstruction(url));

		return this;
	}

	waitFor(locator: string) {
		this.instructions.push(new WaitForInstruction(locator));

		return this;
	}

	waitWhile(locator: string) {
		this.instructions.push(new WaitWhileInstruction(locator));

		return this;
	}

	addInstruction(instruction: Instruction) {
		this.instructions.push(instruction);
	}

	execute(project: Project, viewport?: Viewport): Execution {
		return new Execution(this, project, viewport);
	}
}