import { cpus } from "os";
import { Browser, launch, Permission, Page, Viewport } from "puppeteer";

export class BrowserManager {
	private browsers: Browser[] = [];
	private rotationIndex = 0;
	private size = Math.ceil(Math.max(1, cpus().length) / 4);

	setSize(size: number) {
		this.size = size;
	}

	running(): boolean {
		return this.browsers.length > 0;
	}

	async launch(headless?: boolean): Promise<BrowserManager> {
		if (headless === undefined) {
			headless = true;
		}

		for (let index = 0; index < this.size; index++) {
			const browser = await launch({ headless: headless });
			this.browsers.push(browser);
		}

		return this;
	}

	async close() {
		await this.browsers.map(async browser => await browser.close());
		
		this.browsers = [];
		this.rotationIndex = 0;
	}

	async getPage(viewport: Viewport): Promise<Page> {
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
			throw new Error(`Attempted to gather a page without launching the browser manager`);
		}
	}

	static async overridePermissions(page: Page, permissions: Permission[]) {
		const browser = await page.browser();
		const context = await browser.defaultBrowserContext();
		const url = page.url();

		await context.overridePermissions(url, permissions);
	}
}