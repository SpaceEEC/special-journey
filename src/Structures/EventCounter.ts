// copy pasted from gus' EventCount and added type notations as well as comments

/**
 * EventCounter class for the statisticsTM.
 */
export class EventCounter
{
	/**
	 * Stored event names with their respective count
	 * @private
	 */
	private events: { [type: string]: number } = {};
	/**
	 * Stored OP codes with their respective count
	 * @private
	 */
	private ops: { [type: number]: number } = {};
	/**
	 * Frequency of events per second
	 * @private
	 */
	private frequency: number = 0;
	/**
	 * Total number of events
	 * @private
	 */
	private total: number = null;
	/**
	 * Starting point
	 * @private
	 */
	private start: Date = null;

	/**
	 * Resets the EventCounter's stats.
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
	 * To be called on every raw packet from the WebSocket.
	 * @param {string|number} event The event name or OP code
	 * @return {void}
	 */
	public trigger(event: string | number): void
	{
		if (typeof event === 'string')
		{
			if (!this.events[event]) this.events[event] = 1;
			else ++this.events[event];
		}
		else
		{
			if (!this.ops[event]) this.ops[event] = 1;
			else ++this.ops[event];
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
		if (Object.keys(this.events).length === 0) return `EventCounter {}`;
		return `
EventCounter
{
	Frequenzy => ${this.frequency.toFixed(0)} events/sec,
	Total => ${this.total.toLocaleString('en-us')} events,
	Start => ${this.start.toUTCString()},
	OPCodes:
	{
		${Object.entries(this.ops).map(([k, v]: [string, number]) => `${k} => ${v.toLocaleString('en-us')}`).join(',\n		')},
	}
	Events:
	{
		${Object.entries(this.events).map(([k, v]: [string, number]) => `${k} => ${v.toLocaleString('en-us')}`).join(',\n		')}
	}
	// ${((this.events.PRESENCE_UPDATE / this.total) * 100).toFixed(2)}% of all events are presence updates //
}`;
	}
}
