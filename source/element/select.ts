import { Feature } from "../feature";
import { SelectInstruction } from "../instruction/select";
import { SingleElement } from "./single";

export class SelectElement {
	constructor(
		private element: SingleElement
	) {}

	first(): Feature {
		const option = this.element.elements('option').first();
		this.element.feature.addInstruction(new SelectInstruction(this.element, option));

		return this.element.feature;
	}

	last(): Feature {
		const option = this.element.elements('option').last();
		this.element.feature.addInstruction(new SelectInstruction(this.element, option));

		return this.element.feature;
	}

	get(index: number): Feature {
		const option = this.element.elements('option').get(index);
		this.element.feature.addInstruction(new SelectInstruction(this.element, option));

		return this.element.feature;
	}

	value(value: string): Feature {
		const option = this.element.element('option', value);
		this.element.feature.addInstruction(new SelectInstruction(this.element, option));

		return this.element.feature;
	}
}