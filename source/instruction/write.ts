import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";

export class WriteInstruction extends Instruction {
	private fieldName: string;

	constructor(
		private tag: string,
		private content: string
	){
		super();
	}

	public step(instruction: WriteInstruction): string {
		super.checkState();

		return ``;
	}

	public async execute(project: Project, page: Page) {
		// todo
	}
}