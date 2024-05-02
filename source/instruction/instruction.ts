export interface Instruction {
	step(instruction: Instruction): string;
	execute();
}