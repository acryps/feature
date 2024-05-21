import { Page, ScreenRecorder } from "puppeteer";
import { ClickInstruction } from "./instruction/click";
import { Instruction } from "./instruction/instruction";
import { NavigationInstruction } from "./instruction/navigate";
import { PrepareInstruction } from "./instruction/prepare";
import { PresentInstruction } from "./instruction/present";
import { WriteInstruction } from "./instruction/write";
import { Project } from "./project";
import { RedirectInstruction } from "./instruction/redirect";
import { Mouse } from "./video/mouse";

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

	public async execute(project: Project, page: Page, configuration: {guide: boolean, screenshots: boolean, video: boolean}) {
		const steps: {
			guide: string[];
			screenshots: {
				image: Buffer;
				highlight: DOMRect[];
				ignore: DOMRect[];
			}[];
		}[] = [];

		const mouse = new Mouse(page, configuration.video);

		let recorder: ScreenRecorder;
		
		if (configuration.video) {
			recorder = await page.screencast({path: 'video.webm'});
		}

		try {
			for (let instruction of this.instructions) {
				steps.push(await instruction.execute(project, page, mouse, {guide: configuration.guide, screenshots: configuration.screenshots}));
			}
		} catch (error) {
			console.error(`[error] failed to execute feature '${this.name}': '${error}'`);
			
			if (error instanceof Error) {
				console.error(`[error] ${error.stack}`);
			}
		}

		await recorder?.stop();

		const motion = mouse.motion;

		return {
			motion: motion,
			steps: steps
		};
	}
}