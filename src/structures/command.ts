import { Message } from 'discord.js';
import SelfbotClient from './client';

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
	/** The Client that instantiated this command */
	public readonly client: SelfbotClient;
	/** The name of this command */
	public readonly name: string;
	/** The aliases for this command, if any */
	public readonly aliases: string[];

	public constructor(client: SelfbotClient, options?: CommandOptions) {
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
	public async run(msg: Message, args: string[], info: CommandInformations): Promise<Message | Message[]> {
		// tslint:disable-next-line:ter-max-len
		throw new Error(`${this.name} (${this.constructor.name}) somehow failed to implement a run() method, what a great achievement!`);
	}
}
