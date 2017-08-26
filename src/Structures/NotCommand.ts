import { Message } from 'discord.js';

import { Client } from './Client';
import { Logger } from './Logger';

/**
 * NotCommand, will be run on every message that is not a command.
 * Needs a better name.
 * @abstract
 */
export class NotCommand
{
	/**
	 * The Client that instantiated this "NotCommand"
	 * @readonly
	 */
	protected readonly client: Client;
	/**
	 * Logger of this "NotCommand"
	 * Only present when using the @Loggable decorator
	 * @readonly
	 */
	protected readonly logger: Logger;

	/**
	 * Intended to be used while deriving.
	 * @param {Client} client
	 */
	constructor(client: Client)
	{
		if (!(client instanceof Client))
		{
			throw new Error(`(${this.constructor.name})'s client is not instanceof Client!`);
		}

		this.client = client;
	}

	/**
	 * Executes this "NotCommand".
	 * @param {Message} msg The message to pass to this "NotCommand"
	 * @param {Message} oldMsg The old message if updated / edited
	 * @returns {Promise<void>}
	 */
	public async run(msg: Message, oldMsg: Message): Promise<any>
	{
		// tslint:disable-next-line:max-line-length
		throw new Error(`${__filename} (${this.constructor.name}) somehow failed to implement a run() method, what a great achievement!`);
	}

	/**
	 * Since the filename is supposed to be the class name without the NotCommand suffix
	 * This will be returned without a file extension!
	 * @returns {string}
	 */
	public get filename(): string
	{
		return this.constructor.name.replace('NotCommand', '');
	}
}
