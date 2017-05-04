import { Message } from 'discord.js';

import SelfbotClient from '../structures/client';
import { Command } from '../structures/command';
import { ConvertResponse } from '../types/sherlockTypes';

const { post }: { post: any } = require('snekfetch');

export default class ConvertCommand extends Command {
	public constructor(client: SelfbotClient) {
		super(client, {
			name: 'CONVERT',
			aliases: ['C']
		});
	}

	public async run(msg: Message, args: string[]): Promise<Message | Message[]> {
		const { body }: { body: ConvertResponse } = await post('https://api.kurisubrooks.com/api/compute/convert')
			.set('Authorization', this.client.config.sherlock)
			.send({ query: args.join(' ') })
			.catch((response: any) => response);
		if (body.ok) {
			return msg.edit(`${body.input.display} <=> ${body.output.display}`);
		} else {
			return msg.edit(`\u200b${msg.content}\n\`E-ROHR\`${body.error}`);
		}
	}
}
