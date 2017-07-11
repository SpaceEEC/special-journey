import { Message } from 'discord.js';

import { SelfbotClient } from '../structures/client';
import { Command } from '../structures/command';

export default class AliveCommand extends Command
{
	public constructor(client: SelfbotClient)
	{
		super(client,
			{
				name: 'ALIVE',
			},
		);
	}

	public async run(msg: Message, args: string[]): Promise<Message | Message[]>
	{
		return msg.delete();
	}
}
