import { Page } from "puppeteer";
import { Project } from "../project";
import { Instruction } from "./instruction";

export class NavigationInstruction extends Instruction {
	private targetTitle: string;	// title of next page
	private navigationName: string;	// location information

	constructor(
		private tag: string
	){
		super();
	}

	public step(instruction: NavigationInstruction): string {
		super.checkState();

		return ``;
	}

	public async execute(project: Project, page: Page) {
		// todo
	}
}