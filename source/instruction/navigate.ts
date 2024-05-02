import { Instruction } from "./instruction";

export class NavigationInstruction implements Instruction {
	private targetTitle: string;	// title of next page
	private navigationName: string;	// location information

	constructor(
		private tag: string
	){}

	public step(click: NavigationInstruction): string {
		return ``;
	}

	public async execute() {
		// todo
	}
}