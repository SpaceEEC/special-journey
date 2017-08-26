import { DeconstructedSnowflake, Message, SnowflakeUtil } from 'discord.js';
import * as moment from 'moment';

import { Aliases, Command } from '../Structures/Command';

@Aliases('SNOW')
export class SnowflakeCommand extends Command
{
	public run(msg: Message, [already]: [string]): Promise<Message>
	{
		if (!already) return msg.edit(`\u200b${msg.content} ${SnowflakeUtil.generate()}`);

		const { date }: DeconstructedSnowflake = SnowflakeUtil.deconstruct(already);

		return msg.edit(
			[
				`\u200b${msg.content}`,
				'```ldif',
				moment(date).utc().format('YYYY-MM-DDD HH:mm:ss'),
				'```',
			],
		);
	}
}
