import { Page } from "puppeteer";
import { PageParser } from "../page/parser";

export class Mouse {
    public x = 0;
    public y = 0;

    private stepTimeout = 1000 / 60;
    private movementDuration = 3 * 1000;

    private clickTimeout = 1000 / 10;

    constructor(
        private page: Page,
        private recording: boolean
    ) {}

    public async click(x: number, y: number) {
        if (this.recording) {
			await this.simulateCursorMovement(x, y);

            await new Promise<void>(done => setTimeout(() => done(), this.clickTimeout));
		}

        await this.page.mouse.click(x, y);
        await this.page.waitForNetworkIdle();
    }

    public async simulateCursorMovement(x: number, y: number) {
        const deltaX = x - this.x;
        const deltaY = y - this.y;

        const steps = this.movementDuration / this.stepTimeout;

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

    public async scrollIntoView(page: Page, id: string) {
        const behavior: ScrollBehavior = this.recording ? 'smooth' : 'auto';

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