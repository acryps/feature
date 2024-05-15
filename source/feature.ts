import { Page } from "puppeteer";
import { ClickInstruction } from "./instruction/click";
import { Instruction } from "./instruction/instruction";
import { NavigationInstruction } from "./instruction/navigate";
import { PrepareInstruction } from "./instruction/prepare";
import { PresentInstruction } from "./instruction/present";
import { WriteInstruction } from "./instruction/write";
import { Project } from "./project";
import { RedirectInstruction } from "./instruction/redirect";
import * as filestream from 'fs';
import { Recorder } from "./video/recorder";

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

	public click(locator: string, elementContent?: string): Feature {
		this.instructions.push(new ClickInstruction(locator, elementContent));

		return this;
	}

	public navigate(locator: string, title: string): Feature {
		this.instructions.push(new NavigationInstruction(locator, title));

		return this;
	}

	public redirect(url: string): Feature {
		this.instructions.push(new RedirectInstruction(url));

		return this;
	}

	public write(locator: string, content: string): Feature {
		this.instructions.push(new WriteInstruction(locator, content));

		return this;
	}

	public present(locator: string, valueTags?: string[]): Feature {
		this.instructions.push(new PresentInstruction(locator, valueTags));

		return this;
	}

	public async execute(project: Project, page: Page) {
		try {
			const recorder = new Recorder(page, `${__dirname}/../video`, 'video.mp4');
			recorder.start();

			const basePath = this.initializeMediaStorage(project);

			for (let [index, instruction] of this.instructions.entries()) {
				await instruction.execute(project, page, basePath, index, recorder);
			}

			recorder.stop();
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

	private initializeMediaStorage(project: Project) {
		const path = `${process.env.MEDIA_BASEPATH}/${project.name}/${this.name}/`;

		if (!filestream.existsSync(path)){
			filestream.mkdirSync(path, { recursive: true });
		}

		return path;
	} 
}