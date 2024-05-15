import { Page } from "puppeteer";
import { Project } from "../project";
import { Recorder } from "../video/recorder";
import * as filestream from 'fs';

export abstract class Instruction {
	public executed: boolean = false;
	public project?: Project;
	
	public step(instruction: Instruction): string {
		throw new Error("Method not implemented.")
	}
	
	public async execute(project: Project, page: Page, basePath: string, index: number, recorder?: Recorder) {
		throw new Error("Method not implemented.");
	}

	public checkState() {
		if (!this.executed) {
			throw new Error(`[error] cannot get step of instruction which has not been executed.`);
		}
	}

	public onSuccess(project: Project) {
		this.project = project;
		this.executed = true;
	}

	public async saveImageAndMetadata(page: Page, basePath: string, filename: string, highlight: DOMRect[]) {
		await page.screenshot({
			path: `${basePath}${filename}.jpg`
		});

		if (highlight) {
			const metadata = this.createMetadata(highlight, null);
			
			filestream.writeFileSync(`${basePath}${filename}.json`, metadata, 'utf-8');
		}
	}

	private createMetadata(highlight?: DOMRect[], ignore?: DOMRect[]) {
		const data = {
			highlight: highlight,
			ignore: ignore
		};

		return JSON.stringify(data);
	}
}