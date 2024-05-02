import { Instruction } from "./instruction";

export class PresentInstruction implements Instruction {
	private areaName: string;

	constructor(
		private tag: string
	){}

	public step(click: PresentInstruction): string {
		return ``;
	}

	public async execute() {
		// todo
	}
}