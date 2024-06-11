import { Page } from "puppeteer";
import { Keyboard } from "../keyboard/keyboard";
import { PageScraper } from "./scraper";
import { Mouse } from "../mouse/mouse";
import { ExecutionConfiguration } from "../execution/configuration";

export class PageInteractor {
	public readonly scraper: PageScraper;
	public readonly mouse: Mouse;
	public readonly keyboard: Keyboard;
	
	constructor(
		public readonly page: Page,
		public readonly configuration: ExecutionConfiguration
	) {
		this.scraper = new PageScraper(this.page);
		this.mouse = new Mouse(this.scraper, this.configuration.video);
		this.keyboard = new Keyboard(this.page, this.configuration.video);
	}
}