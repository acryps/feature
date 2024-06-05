import { ScreenRecorder, Viewport } from "puppeteer";
import { Project } from "../project";
import { ExecutionResult } from "./result";
import { BrowserManager } from "../browser/manager";
import { Step } from "./step";
import { Mouse } from "../mouse/mouse";
import { Feature } from "../feature";
import * as filesystem from 'fs';

export class Execution {
	private configuration = {
		guide: true,
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

	async run(): Promise<ExecutionResult> {
		try {
			if (this.configuration.guide || this.configuration.screenshots) {
				const page = await BrowserManager.getPage(this.viewport);
				const steps: Step[] = [];
				const mouse = new Mouse(page, false);

				try {
					for (let instruction of this.feature.instructions) {
						const configuration = { guide: this.configuration.guide, screenshots: this.configuration.screenshots };
						steps.push(await instruction.execute(this.project, page, mouse, configuration));
					}
				} catch (error) {
					const separator = this.configuration.guide && this.configuration.screenshots ? ' and ' : ' ';
					throw new Error(`Failed to capture ${this.configuration.guide ? 'guide' : ''}${separator}${this.configuration.screenshots ? 'screenshots' : ''}: '${error}'`);
				}

				this.result.steps = steps;
			}

			if (this.configuration.video) {
				if (!this.videoPath) {
					throw new Error(`Cannot capture video without specified path`);
				}

				const page = await BrowserManager.getPage(this.viewport);
				const mouse = new Mouse(page, true);

				const pathParts = this.videoPath.split('/');
				const name = pathParts.pop().split('.').slice(0, -1).join('.');	// remove the extension
				const path = pathParts.join('/');

				if (!filesystem.existsSync(path)) {
					filesystem.mkdirSync(path, {recursive: true});
				}
				
				const recorder: ScreenRecorder = await page.screencast({path: `${path}/${name}.webm`});

				try {
					for (let instruction of this.feature.instructions) {
						await instruction.execute(this.project, page, mouse, {guide: false, screenshots: false});
					}
				} catch (error) {
					throw new Error(`Failed to record video: '${error}'`);
				}
		
				await recorder?.stop();
		
				this.result.motion = mouse.motion;
				this.result.videoSource = `${path}/${name}.webm`;
			}
		} catch (error) {
			throw new Error(`Failed to execute feature '${this.feature.name}': '${error}'`);
		}

		return this.result;
	}
}