import { Instruction } from "./instruction";

export class WriteInstruction implements Instruction {
	private fieldName: string;

	constructor(
		private tag: string,
		private content: string
	){}

	public step(click: WriteInstruction): string {
		return ``;
	}

	public async execute() {
		// todo
	}
}