import { KeyInput, Page } from "puppeteer";

export class Keyboard {
	private readonly keyStrokeTimeout = 50;
	private readonly focusTimeout = 10;

	constructor(
		private page: Page,
		private recording: boolean
	) {}

	async write(id: string, content: string): Promise<string> {
		await this.page.evaluate((id, content) => {
			const input: HTMLElement = window[id];
			input.focus();

			if (document.activeElement !== input) {
				throw new Error(`Failed to focus on current element and thus cannot write '${content}' (use only input or editable elements!)`);
			}

			// remove previous content
			input.textContent = '';
		}, id, content);

		if (this.recording) {
			await new Promise<void>(done => setTimeout(() => done(), this.focusTimeout));
		}

		for (let character of content) {
			await this.page.keyboard.press(character as KeyInput);

			if (this.recording) {
				// simulate typing of characters
				await new Promise<void>(done => setTimeout(() => done(), this.keyStrokeTimeout));
			}
		}

		await this.page.evaluate(id => window[id].blur(), id);

		return await this.page.evaluate(id => window[id].placeholder, id);
	}
}