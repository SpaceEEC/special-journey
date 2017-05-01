import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';

import SelfbotClient from '../structures/client';
import { Command } from '../structures/command';

export default class ReloadCommand extends Command {
	public constructor(client: SelfbotClient) {
		super(client, {
			name: 'RELOAD'
		});
	}

	public async run(msg: Message, args: string[]): Promise<Message | Message[]> {
		try {
			this.client.reloadCommand(args[0]);
			return msg.delete();
		} catch (err) {
			return msg.edit(stripIndents`
			\u200b${msg.content}

			\`E-ROHR\`
			\`\`\`js
			${err && err.message.startsWith('Cannot find module') ? 'Error: Not found' : err.message}
			\`\`\``);
		}
	}
}
