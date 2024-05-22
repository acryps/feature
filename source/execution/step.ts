export class Step {
	public guide: string[];
	public screenshots: {
		image: Buffer;
		highlight: DOMRect[];
		ignore: DOMRect[];
	}[];
}