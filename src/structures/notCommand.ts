import { Message } from 'discord.js';

import { SelfbotClient } from './client';
import { Logger } from './logger';

/** Needs a better name. */
export class NotCommand {
	/** The Client that instantiated this "NotCommand" */
	protected readonly client: SelfbotClient;
	/** Logger of this "NotCommand" */
	protected readonly logger: Logger;

	public constructor(client: SelfbotClient) {
		if (!(client instanceof SelfbotClient)) throw new Error(`${this.constructor.name}'s client is not a SelfbotClient!`);
		this.client = client;
	}

	/**
	 * Executes this "NotCommand".
	 * @param {Message} msg The message to pass to this "NotCommand"
	 * @param {Message} oldMsg The old message if updated / edited
	 * @returns {Promise<void>}
	 */
	public async run(msg: Message, oldMsg: Message): Promise<void> {
		// tslint:disable-next-line:max-line-length
		throw new Error(`${__filename} (${this.constructor.name}) somehow failed to implement a run() method, what a great achievement!`);
	}
}
