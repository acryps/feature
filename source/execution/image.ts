export class Image {
	public image: Buffer;
	public annotations: ImageAnnotations;
}

export class ImageAnnotations {
	public highlight: DOMRect[];
	public ignore: DOMRect[];
}