import { join } from 'path';

import { Client } from './Client';
import { Command } from './Command';
import { CommandRegistry } from './CommandRegistry';
export { Aliases } from '../Types/CommandDecorators';

/**
 * Represents a group of commands (sub commands)
 * @abstract
 */
export class CommandGroup<T extends CommandGroup<T>> extends CommandRegistry<Command<T>>
{
	/**
	 * Name for this command group
	 * @readonly
	 */
	public readonly name: string;
	/**
	 * Aliases for this command group
	 * @readonly
	 */
	public readonly aliases: string[];
	/**
	 * Where this file (the derived class) is located
	 * @readonly
	 */
	public readonly _dirname: string;
	/**
	 * The full path including the file name of this class
	 * @readonly
	 */
	public readonly _filename: string = `${join(this._dirname, this.filename)}.js`;

	/**
	 * Intended to be used while deriving.
	 * @param {Client} client
	 */
	constructor(client: Client)
	{
		super(client);

		this.name = this.filename.toUpperCase();
		if (!this.aliases) this.aliases = [];
		if (!this._dirname) throw new Error(`${this.name} (${__filename}) does not have _dirname!`);
		if (!this.logger) throw new Error(`${this.name} (${__filename}) does not have a logger!`);
	}

	/**
	 * Since the filename is supposed to be the class name without the CommandGroup suffix
	 * This will be returned without a file extension!
	 * @returns {string}
	 */
	public get filename(): string
	{
		return this.constructor.name.replace('CommandGroup', '');
	}
}
