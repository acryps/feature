import { Page } from "puppeteer";
import { ClickInstruction } from "./instruction/click";
import { Instruction } from "./instruction/instruction";
import { NavigationInstruction } from "./instruction/navigate";
import { PrepareInstruction } from "./instruction/prepare";
import { PresentInstruction } from "./instruction/present";
import { WriteInstruction } from "./instruction/write";
import { Project } from "./project";

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

	public click(tags: string[]): Feature {
		this.instructions.push(new ClickInstruction(tags));

		return this;
	}

	public navigate(tag: string): Feature {
		this.instructions.push(new NavigationInstruction(tag));

		return this;
	}

	public write(tag: string, content: string): Feature {
		this.instructions.push(new WriteInstruction(tag, content));

		return this;
	}

	public present(tag: string): Feature {
		this.instructions.push(new PresentInstruction(tag));

		return this;
	}

	public async execute(project: Project, page: Page) {
		const tasks: Promise<any>[] = [];

		for (let instruction of this.instructions) {
			tasks.push(instruction.execute(project, page));
		}

		await Promise.all(tasks);
	}

	public generateGuide(): string {
		const steps: string[] = [];

		for (let [index, instruction] of this.instructions.entries()) {
			steps.push(`${index + 1}. ${instruction.step(instruction)}`);
		}

		return steps.join('\n');
	}
}