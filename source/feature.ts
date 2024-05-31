import { ScreenRecorder } from "puppeteer";
import { ClickInstruction } from "./instruction/click";
import { Instruction } from "./instruction/instruction";
import { NavigationInstruction } from "./instruction/navigate";
import { ShowInstruction } from "./instruction/show";
import { WriteInstruction } from "./instruction/write";
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
import { HoverInstruction } from "./instruction/hover";
import { ScrollToInstruction } from "./instruction/scroll-to";
import { CopyToClipboardInstruction } from "./instruction/clipboard/copy-to";
import { WriteFromClipboardInstruction } from "./instruction/clipboard/write-from";
import { WaitForInstruction } from "./instruction/wait-for";
import { WaitWhileInstruction } from "./instruction/wait-while";
import * as filesystem from 'fs';

export class Feature {
	private instructions: Instruction[];
	private executionResult: ExecutionResult;

	constructor (
		public name: string,
		public description: string,
	) {
		this.instructions = [];
		this.executionResult = new ExecutionResult();
	}

	click(locator: string, elementContent?: string): Feature {
		this.instructions.push(new ClickInstruction(locator, elementContent));

		return this;
	}

	navigate(locator: string, title: string): Feature {
		this.instructions.push(new NavigationInstruction(locator, title));

		return this;
	}

	redirect(url: string): Feature {
		this.instructions.push(new RedirectInstruction(url));

		return this;
	}

	write(locator: string, content: string): Feature {
		this.instructions.push(new WriteInstruction(locator, content));

		return this;
	}

	show(locator: string, valueTags?: string[]): Feature {
		this.instructions.push(new ShowInstruction(locator, valueTags));

		return this;
	}

	hover(locator: string, elementContent?: string): Feature {
		this.instructions.push(new HoverInstruction(locator, elementContent));

		return this;
	}

	scrollTo(locator: string, elementContent?: string): Feature {
		this.instructions.push(new ScrollToInstruction(locator, elementContent));

		return this;
	}

	copyToClipboard(locator: string): Feature {
		this.instructions.push(new CopyToClipboardInstruction(locator));

		return this;
	}

	writeFromClipboard(locator: string): Feature {
		this.instructions.push(new WriteFromClipboardInstruction(locator));

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