// mostly copied from
// https://github.com/zajrik/yamdbf/blob/master/src/util/logger/Logger.ts
// and
// https://github.com/1Computer1/kaado/blob/master/src/util/Logger.js

import * as moment from 'moment';
import { inspect } from 'util';

import { colors, LogLevel } from '../types/LogLevel';

export { LogLevel };

export { logger, Loggable } from '../types/LoggerDecorator';

/**
 * The singleton logger
 */
export class Logger
{
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
	 * @param {string} tag
	 * @param {...any} input Whatever to write
	 * @returns {Promise<void>}
	 */
	public async silly(tag: string, ...input: any[]): Promise<void>
	{
		this._write(LogLevel.SILLY, tag, input);
	}

	/**
	 * Writes a debug message to console, if applicable.
	 * @param {string} tag
	 * @param {...any} input Whatever to write
	 * @returns {Promise<void>}
	 */
	public async debug(tag: string, ...input: any[]): Promise<void>
	{
		this._write(LogLevel.DEBUG, tag, input);
	}

	/**
	 * Writes a verbose message to console, if applicable.
	 * @param {string} tag
	 * @param {...any} input Whatever to write
	 * @returns {Promise<void>}
	 */
	public async verbose(tag: string, ...input: any[]): Promise<void>
	{
		this._write(LogLevel.VERBOSE, tag, input);
	}

	/**
	 * Writes an info message to console, if applicable.
	 * @param {string} tag
	 * @param {...any} input Whatever to write
	 * @returns {Promise<void>}
	 */
	public async info(tag: string, ...input: any[]): Promise<void>
	{
		this._write(LogLevel.INFO, tag, input);
	}

	/**
	 * Writes a warn message to console, if applicable.
	 * @param {string} tag
	 * @param {...any} input Whatever to write
	 * @returns {Promise<void>}
	 */
	public async warn(tag: string, ...input: any[]): Promise<void>
	{
		this._write(LogLevel.WARN, tag, input);
	}

	/**
	 * Writes an error message to console, if applicable.
	 * @param {string} tag
	 * @param {...any} input Whatever to write
	 * @returns {Promise<void>}
	 */
	public async error(tag: string, ...input: any[]): Promise<void>
	{
		this._write(LogLevel.ERROR, tag, input);
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
	 * @param {LogLevel} level The log level of this message
	 * @param {string} output The output to write to console
	 * @returns {void}
	 * @private
	 */
	private _write(level: LogLevel, tag: string, input: any[]): void
	{
		if (this._logLevel < level) return;
		const out: NodeJS.Socket = level === LogLevel.ERROR ? process.stderr : process.stdout;
		const output: string = this._prepareText(input);

		out.write(
			[
				`[${moment().format('DD.MM.YYYY HH:mm:ss')}]`,
				`[\u001b[1m\u001b[${colors[level]}m${LogLevel[level]}\u001b[0m]`,
				`${tag || ''}${output ? `: ${output}` : ''}\n`,
			].join(''),
		);
	}
}
