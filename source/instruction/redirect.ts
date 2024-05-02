import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";

export class RedirectInstruction implements Instruction {
	private target: string;
	private source: string;

	constructor(
		private tag: string
	){}

	public step(click: RedirectInstruction): string {
		return ``;
	}

	public async execute(project: Project, page: Page) {
		// todo
	}
}