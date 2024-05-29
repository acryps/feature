export class Image {
	image: Buffer;
	annotations: ImageAnnotations;
}

export class ImageAnnotations {
	highlight: DOMRect[];
	ignore: DOMRect[];
}