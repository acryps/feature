import { cpus } from "os";
import { Browser, launch } from "puppeteer";

export class BrowserManager {
	private browsers: Browser[] = [];
	private rotationIndex = 0;
	private viewportConfiguration = {
		big: { width: 1920, height: 1080 },
		medium: { width: 1280, height: 720 },
		small: { width: 1024, height: 786 }
	};

	constructor(
		private size: number = Math.ceil(Math.max(1, cpus().length) / 4)
	) {}

	get running(): boolean {
		return this.browsers.length > 0;
	}

	async launch() {
		for (let index = 0; index < this.size; index++) {
			this.browsers.push(await launch({
				headless: false,
				defaultViewport: this.viewportConfiguration.small
			}));
		}
	}

	async close() {
		await this.browsers.map(async browser => await browser.close());
		this.browsers = [];
	}

	async getPage() {
		const page = await this.browsers[this.rotationIndex].newPage();
		await page.setViewport(this.viewportConfiguration.small);

		if (this.rotationIndex + 1 == this.browsers.length) {
			this.rotationIndex = 0;
		} else {
			this.rotationIndex++;
		}

		return page;
	}
}