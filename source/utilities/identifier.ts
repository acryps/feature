export class Identifier {
	static get(): string {
		return this.generate();
	}
	
	private static generate(): string {
		let id = '';
		
		for (let index = 0; index < 64; index++) {
			id += Math.random().toString(16)[3];
		}
		
		return id;
	}
}