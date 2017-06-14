// copy pasted from gus' EventCount and added type notations
import { stripIndents } from 'common-tags';

export class EventCounter {
	public events: { [type: string]: number };
	public ops: { [type: number]: number };
	public frequency: number;
	public total: number;
	public start: Date;

	public constructor() {
		this.reset();
	}

	public reset(): void {
		this.events = {};
		this.ops = {};
		this.frequency = 0;
		this.total = null;
		this.start = null;
	}

	public trigger(event: string | number): void {
		if (typeof event === 'string') {
			if (!this.events[event]) this.events[event] = 0;
			++this.events[event];
		} else {
			if (!this.ops[event]) this.ops[event] = 0;
			++this.ops[event];
		}

		if (!this.start) this.start = new Date();
		this.frequency = ++this.total / ((Date.now() - +this.start) / 1000);
	}

	public get seconds(): number {
		return (Date.now() - +this.start) / 1000;
	}
	public inspect(): string {
		if (Object.keys(this.events).length <= 1) return `EventCounter ${this.events}`;
		return stripIndents`
		EventCounter {
		Frequenzy => ${this.frequency.toLocaleString()} events/sec,
		Total => ${this.total.toLocaleString()} events,
		Start => ${this.start.toUTCString()},
		// OP Codes //
		${Object.entries(this.ops).map(([k, v]: [string, number]) => `${k} => ${v.toLocaleString()}`).join(',\n	  ')},
		// Events //
		${Object.entries(this.events).map(([k, v]: [string, number]) => `${k} => ${v.toLocaleString()}`).join(',\n	  ')}
		// ${((this.events.PRESENCE_UPDATE / this.total) * 100).toFixed(2)}% of all events are presence updates //
		}`;
	}
}
