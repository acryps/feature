import { Page } from "puppeteer";
import { ClickInstruction } from "./instruction/click";
import { Instruction } from "./instruction/instruction";
import { NavigationInstruction } from "./instruction/navigate";
import { PrepareInstruction } from "./instruction/prepare";
import { PresentInstruction } from "./instruction/present";
import { WriteInstruction } from "./instruction/write";
import { Project } from "./project";
import { RedirectInstruction } from "./instruction/redirect";

export class Feature {
	private instructions: Instruction[];

	constructor (
		public name: string,
		public description: string,
	) {
		this.instructions = [];
	}

	public prepare(name: string, route: string): Feature {
		this.instructions.push(new PrepareInstruction(name, route));

		return this;
	}

	public click(tags: string[], elementContent?: string): Feature {
		this.instructions.push(new ClickInstruction(tags, elementContent));

		return this;
	}

	public navigate(tags: string[], title: string): Feature {
		this.instructions.push(new NavigationInstruction(tags, title));

		return this;
	}

	public redirect(url: string): Feature {
		this.instructions.push(new RedirectInstruction(url));

		return this;
	}

	public write(tags: string[], content: string): Feature {
		this.instructions.push(new WriteInstruction(tags, content));

		return this;
	}

	public present(tags: string[], valueTags?: string[]): Feature {
		this.instructions.push(new PresentInstruction(tags, valueTags));

		return this;
	}

	public async execute(project: Project, page: Page) {
		try {
			for (let instruction of this.instructions) {
				await instruction.execute(project, page);
			}
		} catch (error) {
			console.error(`[error] failed to execute feature '${this.name}': '${error}'`);

			if (error instanceof Error) {
				console.error(`[error] ${error.stack}`);
			}
		}
	}

	public generateGuide(): string {
		const steps: string[] = [];

		for (let [index, instruction] of this.instructions.entries()) {
			steps.push(`${index + 1}. ${instruction.step(instruction)}`);
		}

		return steps.join('\n');
	}
}