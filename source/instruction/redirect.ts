import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";

export class RedirectInstruction extends Instruction {
	private target: string;
	private source: string;

	constructor(
		private tag: string
	){
		super();
	}

	public step(instruction: RedirectInstruction): string {
		super.checkState();

		return ``;
	}

	public async execute(project: Project, page: Page) {
		// todo
	}
}