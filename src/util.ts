/**
 * Util class holding all sorts of useful methods.
 */
export class Util {

	/**
	 * Forces a 0 at the beginning of numbers smaller than 9.
	 * @param {number} someNumber The number to be forced to be at max length
	 * @returns {string}
	 * @static
	 */
	public static forceLength(someNumber: number): string {
		return someNumber > 9 ? `${someNumber}` : `0${someNumber}`;
	}

	/**
	 * Formatted timestring for the specified time.
	 * @param {?Date|string} date The date object or timestamp, defaults to now
	 * @returns {string} Timestring in the format DD.MM.YYYY HH:mm:ss
	 */
	public static timeString(date?: Date | string): string {
		// `new Date(undefined)` <- Invalid Date, but `new Date()` <- fine
		// javascript, you are strange
		const d: Date = date ? date instanceof Date ? date : new Date(date) : new Date();
		return [
			Util.forceLength(d.getDate()),
			'.', Util.forceLength(d.getMonth() + 1),
			'.', d.getFullYear(),
			' ', Util.forceLength(d.getHours()),
			':', Util.forceLength(d.getMinutes()),
			':', Util.forceLength(d.getSeconds()),
		].join('');
	}
}
