/** Util class holding all sorts of functions. */
export default class Util {

	/**
	 * Forces a 0 at the beginning of numbers smaller than 9.
	 * @param {number} someNumber The number to be forced to be at max length
	 * @returns {string}
	 * @static
	 */
	public static forceLength(someNumber: number): string {
		return someNumber > 9 ? `${someNumber}` : `0${someNumber}`;
	}

}
