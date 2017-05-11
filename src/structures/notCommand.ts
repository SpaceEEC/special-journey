import { Message } from 'discord.js';
import SelfbotClient from './client';

/** Needs a better name. */
export default class NotCommand {
	/** The Client that instantiated this "NotCommand" */
	protected readonly client: SelfbotClient;

	public constructor(client: SelfbotClient) {
		this.client = client;
	}

	/**
	 * Executes this "NotCommand".
	 * @param {Message} msg The message to pass to this "NotCommand"
	 * @param {Message} oldMsg The old message if updated / edited
	 * @returns {Promise<void>}
	 */
	public async run(msg: Message, oldMsg: Message): Promise<void> {
		// tslint:disable-next-line:ter-max-len
		throw new Error(`${__filename} (${this.constructor.name}) somehow failed to implement a run() method, what a great achievement!`);
	}
}
