import { Page } from "puppeteer";
import { Project } from "../project";

export abstract class Instruction {
	public executed: boolean = false;
	public project?: Project;
	
	public step(instruction: Instruction): string {
		throw new Error("Method not implemented.")
	}
	
	public async execute(project: Project, page: Page) {
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
}