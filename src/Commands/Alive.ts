import { Message } from 'discord.js';

import { Command } from '../Structures/Command';

export class AliveCommand extends Command
{
	public async run(msg: Message): Promise<Message>
	{
		return msg.delete();
	}
}
