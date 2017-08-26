import { Message } from 'discord.js';

import { Command } from '../Structures/Command';
import { Loggable } from '../Types/LoggerDecorator';

@Loggable('[RELOAD]')
export class ReloadCommand extends Command
{
	public async run(msg: Message, args: string[]): Promise<Message>
	{
		if (!args.length) return msg.edit('A command name might be of use here.');

		try
		{
			await this.client.registry.reload(args);
		}
		catch (error)
		{
			this.logger.error(error);
			return msg.edit(error.message, { code: 'js' });
		}

		return msg.delete();
	}
}
