import { Message } from 'discord.js';
import { post, Result } from 'snekfetch';

import { SelfbotClient } from '../structures/client';
import { Command } from '../structures/command';
import { ConvertResponse } from '../types/SherlockTypes';

export default class ConvertCommand extends Command {
	public constructor(client: SelfbotClient) {
		super(client, {
			name: 'CONVERT',
			aliases: ['C'],
		});
	}

	public async run(msg: Message, args: string[]): Promise<Message | Message[]> {
		const body: ConvertResponse = await post('https://api.kurisubrooks.com/api/compute/convert')
			.set('Authorization', this.client.config.sherlock)
			.send({ query: args.join(' ') })
			// not a buffer, thanks
			.then<ConvertResponse>((result: Result) => result.body as any)
			.catch((response: any) => response);
		if (body.ok) {
			return msg.edit(`${body.input.display} <=> ${body.output.display}`);
		} else {
			return msg.edit(`\u200b${msg.content}\n\`E-ROHR\`${body.error}`);
		}
	}
}
