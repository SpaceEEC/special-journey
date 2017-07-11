import { Message } from 'discord.js';

import { SelfbotClient } from './client';
import { Logger } from './logger';

/**
 * Options for this command.
 */
export type CommandOptions =
	{
		/**
		 * The name of this command
		 */
		name: string;
		/**
		 * The aliases of this command, if any
		 */
		aliases?: string[];
	};

/**
 * Informations to pass to a command's execution.
 */
export type CommandInformations =
	{
		/**
		 * The command, or alias, which triggered this command's execution
		 */
		alias: string;
	};

/**
 * Represents a command.
 */
export class Command
{
	/**
	 * Name of this command
	 */
	public readonly name: string;
	/**
	 * Aliases for this command, if any
	 */
	public readonly aliases: string[];
	/**
	 * Client that instantiated this command
	 */
	protected readonly client: SelfbotClient;
	/**
	 * Logger singleton instance.
	 * Only present when using the @logger decorator.
	 */
	protected readonly logger: Logger;

	/**
	 * Intended to be used while deriving.
	 * Paremterless constructing is only to be used while (re)loading commands internally.
	 * @param {SelfbotClient} client
	 * @param {CommandOptions} options
	 */
	public constructor(client: SelfbotClient, options?: CommandOptions)
	{
		if (!(client instanceof SelfbotClient))
		{
			throw new Error(`${options.name} (${this.constructor.name})'s client is not a SelfbotClient!`);
		}
		this.client = client;
		this.name = options.name;
		this.aliases = options.aliases || [];
	}

	/**
	 * Executes this command.
	 * @param {Message} msg The message to pass to this command
	 * @param {string[]} args The args array to pass to this command
	 * @param {CommandInformations} info The CommandInformations to pass to the command's execution
	 * @returns {Promise<Message | Message[]>}
	 */
	public async run(msg: Message, args: string[], info: CommandInformations): Promise<Message | Message[]>
	{
		// tslint:disable-next-line:max-line-length
		throw new Error(`${this.name} (${this.constructor.name}) somehow failed to implement a run() method, what a great achievement!`);
	}
}
