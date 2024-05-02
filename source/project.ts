import { Instruction } from "./instruction/instruction";

export class Project {
	constructor(
		public baseUrl
	) {}

	public htmlTag(name: string) {
		return name;
	}

	public customStep<T extends Instruction>(instructionType: T, customToString: (instance: T) => string) {
		instructionType.step = customToString;
	}
}
