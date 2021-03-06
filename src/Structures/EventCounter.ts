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
	private start: number = null;

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

		if (!this.start) this.start = Date.now();
		this.frequency = ++this.total / ((Date.now() - this.start) / 1000);
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
	Frequency => ${this.frequency.toFixed(0)} events/sec,
	Total => ${this.total.toLocaleString().replace(/,/g, '.')} events,
	Start => ${new Date(this.start).toUTCString()},
	OPCodes:
	{
		${this._formatDict(this.ops)},
	},
	Events:
	{
		${this._formatDict(this.events)},
	},
	// ${((this.events.PRESENCE_UPDATE / this.total) * 100).toFixed(2)}% of all events are presence updates //
}`;
	}

	private _formatDict(dict: { [key: string]: number }): string
	{
		return Object.entries(dict)
			.map(([k, v]: [string, number]) =>
				`${k} => ${v.toLocaleString().replace(/,/g, '.')}`)
			.join(',\n\t\t');
	}
}
