import { cpus } from "os";
import { Browser, launch } from "puppeteer";

export class BrowserManager {
	private browsers: Browser[] = [];
	private rotationIndex = 0;

	constructor(
		private size: number = Math.ceil(Math.max(1, cpus().length) / 4)
	) {}

	get running(): boolean {
		return this.browsers.length > 0;
	}

	async launch() {
		for (let index = 0; index < this.size; index++) {
			this.browsers.push(await launch());
		}
	}

	async close() {
		await this.browsers.map(async browser => await browser.close());
		this.browsers = [];
	}

	async getPage() {
		const page = await this.browsers[this.rotationIndex].newPage();

		if (this.rotationIndex + 1 == this.browsers.length) {
			this.rotationIndex = 0;
		} else {
			this.rotationIndex++;
		}

		return page;
	}
}