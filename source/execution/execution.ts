import { Page, ScreenRecorder, Viewport } from "puppeteer";
import { Project } from "../project";
import { ExecutionResult } from "./result";
import { BrowserManager } from "../browser/manager";
import { Step } from "./step/step";
import { Mouse } from "../mouse/mouse";
import { Feature } from "../feature";
import { ExecutionConfiguration } from "./configuration";
import * as filesystem from 'fs';

export class Execution {
	private configuration = {
		guide: false,
		screenshots: false,
		video: false
	};

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
				const configuration = { guide: this.configuration.guide, screenshots: this.configuration.screenshots };
				const page = await browserManager.getPage(this.viewport);
				const mouse = new Mouse(page, false);

				await this.prepareExecution(page);

				this.result.steps = await this.executeInstructions(page, mouse, configuration);
			}

			if (this.configuration.video) {
				if (!this.videoPath) {
					throw new Error(`Cannot capture video without specified path`);
				}

				const configuration = { guide: false, screenshots: false };
				const page = await browserManager.getPage(this.viewport);
				const mouse = new Mouse(page, true);

				const pathParts = this.videoPath.split('/');
				// remove the file extension
				const name = pathParts.pop().split('.').slice(0, -1).join('.');	
				const path = pathParts.join('/');

				if (!filesystem.existsSync(path)) {
					filesystem.mkdirSync(path, {recursive: true});
				}

				await this.prepareExecution(page);
				
				const recorder: ScreenRecorder = await page.screencast({path: `${path}/${name}.webm`});

				await this.executeInstructions(page, mouse, configuration);
		
				await recorder?.stop();
		
				this.result.motion = mouse.motion;
				this.result.videoSource = `${path}/${name}.webm`;
			}
		} catch (error) {
			throw new Error(`Failed to execute feature '${this.feature.name}': ${error}`);
		}

		await browserManager.close();

		return this.result;
	}

	async prepareExecution(page: Page) {
		const mouse = new Mouse(page, false);

		try {
			for (let prepareInstruction of this.feature.prepareInstructions) {
				await prepareInstruction.execute(this.project, page, mouse, { guide: false, screenshots: false });
			}
		} catch (error) {
			throw new Error(`Failed to execute prepare instructions: ${error}`);
		}
	}

	async executeInstructions(page: Page, mouse, configuration: ExecutionConfiguration) {
		const steps: Step[] = [];

		try {
			for (let instruction of this.feature.instructions) {
				steps.push(await instruction.execute(this.project, page, mouse, configuration));
			}
		} catch (error) {
			throw new Error(`Failed to execute instructions: ${error}`);
		}

		return steps;
	}
}