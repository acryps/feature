import { Identifier } from "./identifier";

export class ClipboardManager {
	private static clipboards: {[id: string] : string } = {};

	static getId(): string {
		let id;

		while (this.clipboards[id]) {
			id = Identifier.get();
		}

		this.clipboards[id] = '';

		return id;
	}

	static read(id: string): string {
		return this.clipboards[id];
	}

	static write(id: string, value: string) {
		this.clipboards[id] = value;
	}
}