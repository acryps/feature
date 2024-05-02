import { Page } from "puppeteer";
import { Project } from "../project";

export interface Instruction {
	step(instruction: Instruction): string;
	execute(project: Project, page: Page);
}