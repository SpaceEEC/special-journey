// copy pasted from gus' EventCount and added type notations
// TODO: custom inspector
export class EventCounter {
	public events: { [type: string]: number };
	public frequency: number;
	public total: number;
	public start: number;

	public constructor() {
		this.reset();
	}

	public reset() {
		this.events = {};
		this.frequency = 0;
		this.total = 0;
		this.start = null;
	}

	public trigger(event: string) {
		if (!this.events[event]) this.events[event] = 0;
		this.events[event]++;

		if (!this.start) this.start = Date.now();
		this.frequency = ++this.total / (Date.now() - this.start) * 1000;
	}
}
