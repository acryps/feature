import { ScreenRecorder } from "puppeteer";
import { Instruction } from "./instruction/instruction";
import { Project } from "./project";
import { RedirectInstruction } from "./instruction/redirect";
import { Mouse } from "./mouse/mouse";
import { Step } from "./execution/step";
import { ExecutionResult } from "./execution/result";
import { BrowserManager } from "./browser/manager";
import { Resolution } from "./browser/resolution";
import { ExecutionConfiguration } from "./execution/configuration";
import { Identifier } from "./utilities/identifier";
import { MotionPoint } from "./mouse/motion-point";
import { WaitForInstruction } from "./instruction/wait-for";
import { WaitWhileInstruction } from "./instruction/wait-while";
import { Single } from "./element/single";
import { Multiple } from "./element/multiple";
import * as filesystem from 'fs';

export class Feature {
	private instructions: Instruction[];
	private executionResult: ExecutionResult;

	private currentElement?: Single | Multiple;

	constructor (
		public name: string,
		public description: string,
	) {
		this.instructions = [];
		this.executionResult = new ExecutionResult();
	}

	element(locator: string, elementContent?: string): Single {
		return new Single(this, locator, elementContent, null, null);
	}

	elements(locator: string): Multiple {
		return new Multiple(this, locator, null, null);
	}

	redirect(url: string): Feature {
		this.instructions.push(new RedirectInstruction(url));

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

	present(): Single | Multiple {
		return this.currentElement;
	}

	addInstruction(instruction: Instruction, element: Single | Multiple) {
		this.currentElement = element;

		this.instructions.push(instruction);
	}

	async execute(project: Project, resolution: Resolution, configuration: ExecutionConfiguration) {
		const page = await BrowserManager.getPage(resolution);

		const steps: Step[] = [];
		const mouse = new Mouse(page, false);

		try {
			for (let instruction of this.instructions) {
				steps.push(await instruction.execute(project, page, mouse, configuration));
			}
		} catch (error) {
			console.error(`[error] failed to execute feature '${this.name}': '${error}'`);
		}

		this.executionResult.steps = steps;

		return steps;
	}

	async generateVideo(project: Project, resolution: Resolution): Promise<{
		videoSource: string,
		motion: MotionPoint[]
	}> {
		const page = await BrowserManager.getPage(resolution);
		
		const mouse = new Mouse(page, true);

		const path = process.env.MEDIA_PATH;
		const name = Identifier.get();

		if (!filesystem.existsSync(path)) {
			filesystem.mkdirSync(path, {recursive: true});
		}
		
		const recorder: ScreenRecorder = await page.screencast({path: `${path}/${name}.webm`});

		try {
			for (let instruction of this.instructions) {
				await instruction.execute(project, page, mouse, {guide: false, screenshots: false});
			}
		} catch (error) {
			console.error(`[error] failed to execute feature '${this.name}': '${error}'`);
		}

		await recorder?.stop();

		this.executionResult.motion = mouse.motion;
		this.executionResult.videoSource = `${path}/${name}.webm`;

		return {
			videoSource: `${path}/${name}.webm`,
			motion: mouse.motion
		}
	}

	getExecutionResult() {
		return this.executionResult;
	}
}