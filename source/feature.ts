import { ScreenRecorder, Viewport } from "puppeteer";
import { Instruction } from "./instruction/instruction";
import { Project } from "./project";
import { GoInstruction } from "./instruction/go";
import { Mouse } from "./mouse/mouse";
import { Step } from "./execution/step";
import { ExecutionResult } from "./execution/result";
import { BrowserManager } from "./browser/manager";
import { ExecutionConfiguration } from "./execution/configuration";
import { Identifier } from "./shared/identifier";
import { MotionPoint } from "./mouse/motion-point";
import { WaitForInstruction } from "./instruction/wait-for";
import { WaitWhileInstruction } from "./instruction/wait-while";
import { SingleElement } from "./element/single-element";
import { MultiElement } from "./element/multi-element";
import * as filesystem from 'fs';

export class Feature {
	private instructions: Instruction[];
	private executionResult: ExecutionResult;

	private currentElement?: SingleElement | MultiElement;

	constructor(
		public name: string,
		public description: string,
	) {
		this.instructions = [];
		this.executionResult = new ExecutionResult();
	}

	element(locator: string, elementContent?: string): SingleElement {
		return new SingleElement(this, locator, elementContent, null, null);
	}

	elements(locator: string): MultiElement {
		return new MultiElement(this, locator, null, null);
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

	present(): SingleElement | MultiElement {
		return this.currentElement;
	}

	addInstruction(instruction: Instruction, element: SingleElement | MultiElement) {
		this.currentElement = element;

		this.instructions.push(instruction);
	}

	async execute(project: Project, viewport: Viewport, configuration: ExecutionConfiguration) {
		const page = await BrowserManager.getPage(viewport);

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

	async generateVideo(project: Project, viewport: Viewport): Promise<{
		videoSource: string,
		motion: MotionPoint[]
	}> {
		const page = await BrowserManager.getPage(viewport);
		
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