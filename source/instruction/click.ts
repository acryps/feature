import { Instruction } from "./instruction";

export class ClickInstruction implements Instruction {
	private clickableName: string;

	private x: number;
	private y: number;

	constructor(
		private tags: string[]
	){}

	public step(click: ClickInstruction): string {
		return ``;
	}

	public async execute() {
		// todo
	}
}