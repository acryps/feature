import { Page } from "puppeteer";
import { PageParser } from "../page/parser";
import { MotionPoint } from "./motion.point";

export class Mouse {
	x = 0;
	y = 0;

	motion: MotionPoint[] = [];
	
	private start: Date;
	private waitTimeout = 1000;
	
	private stepTimeout = 1000 / 60;
	private steps = 100;
	private stepDuration = 100;
	private maxDuration = 300;

	constructor(
		private page: Page,
		private recording: boolean
	) {
		if (recording) {
			this.start = new Date();

			this.addMotionCoordinate();
		}
	}

	async click(x: number, y: number) {
		this.addMotionCoordinate();

		if (this.recording) {
			await this.simulateCursorMovement(x, y);

			await new Promise<void>(done => setTimeout(done, 2 * this.waitTimeout));
		}

		await this.page.mouse.click(x, y);

		this.addMotionCoordinate();

		await this.page.waitForNetworkIdle();
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
		}
	}

	private addMotionCoordinate() {
		if (this.recording) {
			const now = new Date();
			const time = now.getTime() - this.start.getTime();

			this.motion.push({time: time, x: this.x, y: this.y});
		}
	}
}