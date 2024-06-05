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
	private readonly defaultViewport: Viewport = {
		width: 1280, 
		height: 720,
		deviceScaleFactor: 1
	};
	private readonly defaultConfiguration: ExecutionConfiguration = {
		guide: true,
		screenshots: true
	}

	private instructions: Instruction[];

	private currentElement?: SingleElement | MultiElement;

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

	async execute(project: Project, viewport?: Viewport, configuration?: ExecutionConfiguration, executionResult?: ExecutionResult) {
		const page = await BrowserManager.getPage(viewport);
		const steps: Step[] = [];
		const mouse = new Mouse(page, false);

		if (!viewport) {
			viewport = this.defaultViewport;
		}

		if (!configuration) {
			configuration = this.defaultConfiguration;
		}

		try {
			for (let instruction of this.instructions) {
				steps.push(await instruction.execute(project, page, mouse, configuration));
			}
		} catch (error) {
			throw new Error(`Failed to execute feature '${this.name}': '${error}'`);
		}

		executionResult.steps = steps;

		return steps;
	}

	async generateVideo(project: Project, viewport?: Viewport, executionResult?: ExecutionResult): Promise<{
		videoSource: string,
		motion: MotionPoint[]
	}> {
		const page = await BrowserManager.getPage(viewport);
		const mouse = new Mouse(page, true);

		const path = process.env.MEDIA_PATH;
		const name = Identifier.get();

		if (!viewport) {
			viewport = this.defaultViewport;
		}

		if (!filesystem.existsSync(path)) {
			filesystem.mkdirSync(path, {recursive: true});
		}
		
		const recorder: ScreenRecorder = await page.screencast({path: `${path}/${name}.webm`});

		try {
			for (let instruction of this.instructions) {
				await instruction.execute(project, page, mouse, {guide: false, screenshots: false});
			}
		} catch (error) {
			throw new Error(`Failed to execute feature '${this.name}': '${error}'`);
		}

		await recorder?.stop();

		executionResult.motion = mouse.motion;
		executionResult.videoSource = `${path}/${name}.webm`;

		return {
			videoSource: `${path}/${name}.webm`,
			motion: mouse.motion
		}
	}
}