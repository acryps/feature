import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";

export class PrepareInstruction implements Instruction {
	constructor(
		private name: string,
		private route: string
	){}

	public step(click: PrepareInstruction): string {
		return ``;
	}

	public async execute(project: Project, page: Page) {
		// todo
	}
}