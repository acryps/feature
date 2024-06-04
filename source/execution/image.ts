export class Image {
	image: Buffer;
	annotation: ImageAnnotation;
}

export class ImageAnnotation {
	highlight: DOMRect[];
	ignore: DOMRect[];
}