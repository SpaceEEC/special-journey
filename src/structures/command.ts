import { Message } from 'discord.js';

import SelfbotClient from './client';
import Logger from './logger';

/** Options for this command. */
export type CommandOptions = {
	/** The name of this command */
	name: string;
	/** The aliases of this command, if any */
	aliases?: string[];
};

/** Informations to pass to a command's execution. */
export type CommandInformations = {
	/** The command, or alias, which triggered this command's execution */
	alias: string;
};

/** Represents a command. */
export class Command {
	/** The name of this command */
	public readonly name: string;
	/** The aliases for this command, if any */
	public readonly aliases: string[];
	/** The Client that instantiated this command */
	protected readonly client: SelfbotClient;
	/** The logger for this command */
	protected readonly logger: Logger;

	public constructor(client: SelfbotClient, options?: CommandOptions) {
		if (!(client instanceof SelfbotClient)) throw new Error(`${options.name} (${this.constructor.name})'s client is not a SelfbotClient!`);
		this.client = client;
		this.logger = Logger.instance();
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
	public async run(msg: Message, args: string[], info: CommandInformations): Promise<Message | Message[]> {
		// tslint:disable-next-line:ter-max-len
		throw new Error(`${this.name} (${this.constructor.name}) somehow failed to implement a run() method, what a great achievement!`);
	}
}
