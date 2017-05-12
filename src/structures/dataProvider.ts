// TODO: Make that whole thing better.
import { join } from 'path';

type SemiStaticKey = 'ackMe' | 'logIt';

type SemiStatic = {
	[index: string]: any;
	ackMe: string[];
	logIt: string;
};

export default class DataProvider {
	/** Map to cache stuff and keep references accross files */
	private readonly _db: Map<string, any>;

	public constructor() {
		this._db = new Map<string, any>();
		const db: SemiStatic = require(join(__dirname, '..', '..', 'semiStatic'));

		this.set('ackMe', new Set(db.ackMe));
		this.set('logIt', db.logIt);
	}

	/**
	 * Get's data from DataProvider.
	 * @param {SemiStaticKey} key The key to get it's value from
	 * @returns {T}
	 */
	public get<T>(key: SemiStaticKey): T {
		return this._db.get(key) as T;
	}

	/**
	 * Stores data in the Map of the DataProvider, doesn't actually writes to file.
	 * @param {SemiStaticKey} key The key to store data to
	 * @param {any} value The value to store
	 * @returns {void}
	 */
	public set(key: SemiStaticKey, value: any): void {
		this._db.set(key, value);
	}

}
