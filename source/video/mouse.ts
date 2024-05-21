import { Page } from "puppeteer";
import { PageParser } from "../page/parser";

export class Mouse {
	public x = 0;
	public y = 0;

	private stepTimeout = 1000 / 60;

	private movementStep = 100;
	private stepMovementDuration = 100;

	private maxMovementDuration = 300;

	private waitTimeout = 1000;

	constructor(
		private page: Page,
		private recording: boolean
	) {}

	public async click(x: number, y: number) {
		if (this.recording) {
			await this.simulateCursorMovement(x, y);

			await new Promise<void>(done => setTimeout(done, 2 * this.waitTimeout));
		}

		await this.page.mouse.click(x, y);
		await this.page.waitForNetworkIdle();
	}

	public async simulateCursorMovement(x: number, y: number) {
		const deltaX = x - this.x;
		const deltaY = y - this.y;

		const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
		const movementDuration = Math.min((distance / this.movementStep) * this.stepMovementDuration, this.maxMovementDuration);

		const steps = movementDuration / this.stepTimeout;

		const stepSizeX = deltaX / steps;
		const stepSizeY = deltaY / steps;

		console.log(`[info] distance '${distance}', duration '${movementDuration}', steps '${steps}'`);

		for (let step = 0; step < steps; step++) {
			await new Promise<void>(done => setTimeout(async () => {
				this.x += stepSizeX;
				this.y += stepSizeY;

				await this.page.mouse.move(this.x, this.y);

				done();
			}, this.stepTimeout));
		}
	}

	public async scrollIntoView(page: Page, id: string) {
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
}