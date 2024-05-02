import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";

export class PresentInstruction extends Instruction {
	private areaName: string;

	constructor(
		private tag: string
	){
		super();
	}

	public step(instruction: PresentInstruction): string {
		super.checkState();

		return ``;
	}

	public async execute(project: Project, page: Page) {
		// todo
	}
}