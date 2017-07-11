// mostly copied from
// https://github.com/zajrik/yamdbf/blob/master/src/util/logger/Logger.ts
// and
// https://github.com/1Computer1/kaado/blob/master/src/util/Logger.js

import { inspect } from 'util';

import { colors, LogLevel } from '../types/LogLevel';
import { Util } from '../util';

/**
 * The singleton logger
 */
export class Logger
{
	/**
	 * Shortcut to the enum type
	 * @static
	 */
	public static readonly NONE: LogLevel.NONE;

	/**
	 * Shortcut to the enum type
	 * @static
	 */
	public static readonly SILLY: LogLevel.SILLY;

	/**
	 * Shortcut to the enum type
	 * @static
	 */
	public static readonly DEBUG: LogLevel.DEBUG;

	/**
	 * Shortcut to the enum type
	 * @static
	 */
	public static readonly VERBOSE: LogLevel.VERBOSE;

	/**
	 * Shortcut to the enum type
	 * @static
	 */
	public static readonly INFO: LogLevel.INFO;

	/**
	 * Shortcut to the enum type
	 * @static
	 */
	public static readonly WARN: LogLevel.WARN;

	/**
	 * Shortcut to the enum type
	 * @static
	 */
	public static readonly ERROR: LogLevel.ERROR;

	/**
	 * Singleton instance of the logger
	 * @returns {Logger}
	 * @static
	 */
	public static get instance(): Logger
	{
		return Logger._instance || new Logger();
	}

	/**
	 * Logger's singleton instance
	 * @static
	 * @private
	 */
	private static _instance: Logger;

	/**
	 * Current log level
	 * @private
	 */
	private _logLevel: LogLevel;

	/**
	 * Instantiates a new logger
	 * @private
	 */
	private constructor()
	{
		if (Logger._instance)
		{
			throw new Error('Cannot create multiple instances of Logger singleton');
		}
		Logger._instance = this;
		this._logLevel = LogLevel.VERBOSE;
	}

	/**
	 * Sets the level of logging to output.
	 * @param {LogLevel} level The logging level to set
	 * @returns {void}
	 */
	public setLogLevel(level: LogLevel): void
	{
		this._logLevel = level;
	}

	/**
	 * Writes a silly message to console, if applicable.
	 * @param {...any} input Whatever to write
	 * @returns {Promise<void>}
	 */
	public async silly(...input: any[]): Promise<void>
	{
		this._write(LogLevel.SILLY, 'silly', input);
	}

	/**
	 * Writes a debug message to console, if applicable.
	 * @param {...any} input Whatever to write
	 * @returns {Promise<void>}
	 */
	public async debug(...input: any[]): Promise<void>
	{
		this._write(LogLevel.DEBUG, 'debug', input);
	}

	/**
	 * Writes a verbose message to console, if applicable.
	 * @param {...any} input Whatever to write
	 * @returns {Promise<void>}
	 */
	public async verbose(...input: any[]): Promise<void>
	{
		this._write(LogLevel.VERBOSE, 'verbose', input);
	}

	/**
	 * Writes an info message to console, if applicable.
	 * @param {...any} input Whatever to write
	 * @returns {Promise<void>}
	 */
	public async info(...input: any[]): Promise<void>
	{
		this._write(LogLevel.INFO, 'info', input);
	}

	/**
	 * Writes a warn message to console, if applicable.
	 * @param {...any} input Whatever to write
	 * @returns {Promise<void>}
	 */
	public async warn(...input: any[]): Promise<void>
	{
		this._write(LogLevel.WARN, 'warn', input);
	}

	/**
	 * Writes an error message to console, if applicable.
	 * @param {...any} input Whatever to write
	 * @returns {Promise<void>}
	 */
	public async error(...input: any[]): Promise<void>
	{
		this._write(LogLevel.ERROR, 'error', input);
	}

	/**
	 * Cleans and converts input to a string.
	 * @param {any[]} args Input to clean
	 * @returns {string} Cleaned string
	 * @private
	 */
	private _prepareText(args: any[]): string
	{
		const cleanedArgs: string[] = [];
		for (const arg of args)
		{
			cleanedArgs.push(this._clean(arg));
		}

		return cleanedArgs.join(' ');
	}

	/**
	 * Cleans the item and returns a string.
	 * @param {any} item The item to clean
	 * @returns {string} The cleaned item
	 * @private
	 */
	private _clean(item: any): string
	{
		if (typeof item === 'string') return item;
		return inspect(item, { depth: Infinity });
	}

	/**
	 * Writes to console
	 * @param {LogLevel} level The level to determine to write to stdout or stderr
	 * @param {string} output The output to write to console
	 * @returns {void}
	 * @private
	 */
	private _write(level: LogLevel, tag: string, input: any[]): void
	{
		if (this._logLevel < level) return;
		const out: NodeJS.Socket = level === LogLevel.ERROR ? process.stderr : process.stdout;
		const output: string = this._prepareText(input);

		out.write(`${Util.timeString()} - \u001b[1m\u001b[${colors[level]}m${tag}\u001b[0m: ${output}\n`);
	}
}
