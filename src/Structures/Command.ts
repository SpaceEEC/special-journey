import { Message } from 'discord.js';

import { CommandInformation } from '../Types/CommandInformation';
import { Client } from './Client';
import { CommandGroup } from './CommandGroup';
import { Logger } from './Logger';

export { Aliases } from '../Types/CommandDecorators';
export { CommandInformation } from '../Types/CommandInformation';

/**
 * Represents a command.
 * @abstract
 */
export class Command<T extends CommandGroup<any> = never>
{
	/**
	 * Name of this command
	 * @readonly
	 */
	public readonly name: string;
	/**
	 * Aliases for this command, if any
	 * @readonly
	 */
	public readonly aliases: string[];

	/**
	 * Command group of this command, only present if part of one
	 * @protected
	 * @readonly
	 */
	protected readonly group: T;
	/**
	 * Client that instantiated this command
	 * @protected
	 * @readonly
	 */
	protected readonly client: Client;
	/**
	 * Reference to the Logger singleton instance.
	 * Only present when using the @Loggable decorator
	 * @protected
	 * @readonly
	 */
	protected readonly logger: Logger;

	/**
	 * Intended to be used while deriving.
	 * @param {Client} client
	 * @param {T} [group] Only if part of a group
	 */
	public constructor(client: Client, group?: T)
	{
		if (!(client instanceof Client))
		{
			throw new Error(`${this.name} (${this.constructor.name})'s client is not instanceof Client!`);
		}
		this.client = client;
		if (!this.name) this.name = this.filename.toUpperCase();
		if (!this.aliases) this.aliases = [];
		this.group = group || null;
	}

	/**
	 * Executes this command.
	 * @param {Message} msg The message to pass to this command
	 * @param {string[]} args The args array to pass to this command
	 * @param {CommandInformation} info The CommandInformation to pass to the command's execution
	 * @returns {Promise<Message | Message[]>}
	 * @abstract
	 */
	public run(msg: Message, args: string[], info: CommandInformation): any
	{
		// tslint:disable-next-line:max-line-length
		throw new Error(`${this.name} (${this.constructor.name}) somehow failed to implement a run() method, what a great achievement!`);
	}

	/**
	 * Since the filename is supposed to be the class name without the Command suffix
	 * This will be returned without a file extension!
	 * @returns {string}
	 */
	public get filename(): string
	{
		return this.constructor.name.replace('Command', '');
	}
}
