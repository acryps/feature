import { cpus } from "os";
import { Browser, launch, Permission, Page, Viewport } from "puppeteer";

export class BrowserManager {
	private static browsers: Browser[] = [];
	private static rotationIndex = 0;
	private static size = Math.ceil(Math.max(1, cpus().length) / 4);

	static setSize(size: number) {
		this.size = size;
	}

	static running(): boolean {
		return this.browsers.length > 0;
	}

	static async launch(headless: boolean) {
		for (let index = 0; index < this.size; index++) {
			const browser = await launch({ headless: headless });
			this.browsers.push(browser);
		}
	}

	static async close() {
		await this.browsers.map(async browser => await browser.close());
		
		this.browsers = [];
		this.rotationIndex = 0;
	}

	static async getPage(viewport: Viewport) {
		if (this.running()) {
			const page = await this.browsers[this.rotationIndex].newPage();

			await page.setViewport(viewport);
	
			if (this.rotationIndex + 1 == this.browsers.length) {
				this.rotationIndex = 0;
			} else {
				this.rotationIndex++;
			}

			return page;
		} else {
			throw new Error(`attempted to gather page without launching the browser manager`);
		}
	}

	static async overridePermissions(page: Page, permissions: Permission[]) {
		const browser = await page.browser();
		const context = await browser.defaultBrowserContext();
		const url = page.url();

		await context.overridePermissions(url, permissions);
	}
}