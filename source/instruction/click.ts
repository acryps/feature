import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";

export class ClickInstruction extends Instruction {
	private clickableName: string;

	private x: number;
	private y: number;

	constructor(
		private tags: string[]
	){
		super();
	}

	public step(instruction: ClickInstruction): string {
		super.checkState();

		return ``;
	}

	public async execute(project: Project, page: Page) {
		// todo
	}
}