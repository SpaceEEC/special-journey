import { ClientOAuth2Application, Message } from 'discord.js';

import SelfbotClient from '../structures/client';
import { Command, CommandOptions } from '../structures/command';

export default class TestCommand extends Command {
	public constructor(client: SelfbotClient) {
		super(client, {
			name: 'TEST'
		});
	}

	public async run(msg: Message, args: string[]): Promise<Message | Message[]> {
		return msg.delete();
	}
}
