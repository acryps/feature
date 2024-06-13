import { Page, ScreenRecorder, Viewport } from "puppeteer";
import { Project } from "../project";
import { ExecutionResult } from "./result";
import { BrowserManager } from "../browser/manager";
import { Step } from "./step/step";
import { Feature } from "../feature";
import { ExecutionConfiguration } from "./configuration";
import { PageInteractor } from "../page/interactor";
import * as filesystem from 'fs';

export class Execution {
	private configuration = new ExecutionConfiguration(false, false, false);

	private viewport: Viewport = {
		width: 1280, 
		height: 720,
		deviceScaleFactor: 1
	};

	private result: ExecutionResult;
	private videoPath?: string;

	constructor(
		private feature: Feature,
		private project: Project,
		viewport?: Viewport
	) {
		if (viewport) {
			this.viewport = viewport;
		}

		this.result = new ExecutionResult();
	}

	guide(): Execution {
		this.configuration.guide = true;

		return this;
	}

	screenshot(): Execution {
		this.configuration.screenshots = true;

		return this;
	}

	video(path: string): Execution {
		this.configuration.video = true;
		this.videoPath = path;

		return this;
	}

	async run(headless?: boolean): Promise<ExecutionResult> {
		const browserManager = await new BrowserManager().launch(headless);

		try {
			if (this.configuration.guide || this.configuration.screenshots) {
				const configuration = new ExecutionConfiguration(this.configuration.guide, this.configuration.screenshots, false);
				const interactor = new PageInteractor(await browserManager.getPage(this.viewport), configuration);

				await this.executePrepareInstructions(interactor.page);

				this.result.steps = await this.executeInstructions(interactor);
			}

			if (this.configuration.video) {
				if (!this.videoPath) {
					throw new Error(`Cannot capture video without a specified path`);
				}

				// only execute video
				const configuration = new ExecutionConfiguration(false, false, true);
				const interactor = new PageInteractor(await browserManager.getPage(this.viewport), configuration);

				const pathParts = this.videoPath.split('/');

				// remove the file extension
				const name = pathParts.pop().split('.').slice(0, -1).join('.');	
				const path = pathParts.join('/');

				if (!filesystem.existsSync(path)) {
					filesystem.mkdirSync(path, {recursive: true});
				}

				await this.executePrepareInstructions(interactor.page);

				const recorder: ScreenRecorder = await interactor.page.screencast({path: `${path}/${name}.webm`});

				await this.executeInstructions(interactor);
		
				await recorder?.stop();
		
				this.result.motion = interactor.mouse.motion;
				this.result.videoSource = `${path}/${name}.webm`;
			}
		} catch (error) {
			throw new Error(`Failed to execute feature '${this.feature.name}': ${error.message}`);
		}

		await browserManager.close();

		return this.result;
	}

	async executePrepareInstructions(page: Page) {
		// preparation only needs to execute the instructions, nothing else
		const configuration = new ExecutionConfiguration(false, false, false);
		const interactor = new PageInteractor(page, configuration)

		for (let [index, prepareInstruction] of this.feature.prepareInstructions.entries()) {
			try {
				await prepareInstruction.execute(this.project, interactor);
			} catch (error) {
				throw new Error(`Failed to execute the ${index + 1}. prepare feature '${prepareInstruction.feature.name}': ${error.message}`);
			}
		}
	}

	async executeInstructions(interactor: PageInteractor) {
		const steps: Step[] = [];

		for (let [index, instruction] of this.feature.instructions.entries()) {
			try {
				steps.push(await instruction.execute(this.project, interactor));
			} catch (error) {
				throw new Error(`Failed to execute the ${index + 1}. step (${instruction.constructor.name}): ${error.message}`);
			}
		}

		return steps;
	}
}