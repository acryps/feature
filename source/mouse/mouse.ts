import { Page } from "puppeteer";
import { PageParser } from "../page/parser";
import { MotionPoint } from "./point";

export class Mouse {
	private readonly waitTimeout = 1000;
	private readonly stepTimeout = 1000 / 60;
	private readonly steps = 100;
	private readonly stepDuration = 100;
	private readonly maxDuration = 300;

	x: number;
	y: number;

	motion: MotionPoint[];
	
	private start: Date;

	constructor(
		private page: Page,
		private recording: boolean
	) {
		this.x = 0;
		this.y = 0;
		this.motion = [];

		if (recording) {
			this.start = new Date();
			this.addMotionCoordinate();
		}
	}

	async click(x: number, y: number) {
		await this.hover(x, y);
		await this.page.mouse.click(x, y);
		
		await this.page.waitForNetworkIdle();
		await PageParser.waitForUpdates(this.page);
	}

	async hover(x: number, y: number) {
		this.addMotionCoordinate();

		if (this.recording) {
			await this.simulateCursorMovement(x, y);
			await new Promise<void>(done => setTimeout(done, this.waitTimeout));
		} else {
			await this.page.mouse.move(x, y);
		}

		this.addMotionCoordinate();
	}

	async simulateCursorMovement(x: number, y: number) {
		const deltaX = x - this.x;
		const deltaY = y - this.y;

		const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
		const movementDuration = Math.min((distance / this.steps) * this.stepDuration, this.maxDuration);

		const steps = movementDuration / this.stepTimeout;

		const stepSizeX = deltaX / steps;
		const stepSizeY = deltaY / steps;

		for (let step = 0; step < steps; step++) {
			await new Promise<void>(done => setTimeout(async () => {
				this.x += stepSizeX;
				this.y += stepSizeY;

				await this.page.mouse.move(this.x, this.y);

				done();
			}, this.stepTimeout));
		}

		this.x = x;
		this.y = y;

		await this.page.mouse.move(this.x, this.y);
	}

	async scrollIntoView(page: Page, id: string) {
		const behavior: ScrollBehavior = this.recording ? 'smooth' : 'auto';

		if (this.recording) {
			await new Promise<void>(done => setTimeout(done, this.waitTimeout));
		}

		await page.evaluate((id, behavior) => {
			const element: HTMLElement = window[id];

			element.scrollIntoView({
				block: 'center',
				inline: 'center',
				behavior: behavior
			});
		}, id, behavior);

		if (this.recording) {
			await PageParser.waitForUpdates(page);

			await new Promise<void>(done => setTimeout(done, this.waitTimeout));
		}
	}

	private addMotionCoordinate() {
		if (this.recording) {
			const now = new Date();
			const time = now.getTime() - this.start.getTime();

			this.motion.push({ time: time, x: this.x, y: this.y });
		}
	}
}