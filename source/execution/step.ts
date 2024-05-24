export class Step {
	public guide: string[];
	public screenshots: AnnotatedImage[];
}

export class AnnotatedImage {
	public image: Buffer;
	public highlight: DOMRect[];
	public ignore: DOMRect[];
}