// copy pasted from gus' EventCount and added type notations
import { stripIndents } from 'common-tags';

/**
 * EventCounter class for the statisticsTM.
 */
export class EventCounter
{
	/**
	 * Stored event names with a count
	 */
	private events: { [type: string]: number };
	/**
	 * Stored OP codes with a count
	 */
	private ops: { [type: number]: number };
	/**
	 * Frequency of events per second
	 */
	private frequency: number;
	/**
	 * Total number of events
	 */
	private total: number;
	/**
	 * Starting point
	 */
	private start: Date;

	/**
	 * Instantiates a new EventCounter
	 */
	public constructor()
	{
		this.reset();
	}

	/**
	 * Resets the EventCounter's stats
	 * @returns {void}
	 */
	public reset(): void
	{
		this.events = {};
		this.ops = {};
		this.frequency = 0;
		this.total = null;
		this.start = null;
	}

	/**
	 * To be called on every raw event.
	 * @param {string|number} event The event name or OP code
	 * @return {void}
	 */
	public trigger(event: string | number): void
	{
		if (typeof event === 'string')
		{
			if (!this.events[event]) this.events[event] = 0;
			++this.events[event];
		} else
		{
			if (!this.ops[event]) this.ops[event] = 0;
			++this.ops[event];
		}

		if (!this.start) this.start = new Date();
		this.frequency = ++this.total / ((Date.now() - +this.start) / 1000);
	}

	/**
	 * Custom inspector for a nicer display.
	 * @returns {string}
	 */
	public inspect(): string
	{
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
