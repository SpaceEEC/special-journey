import { Message } from 'discord.js';
import { inspect } from 'util';

import { Stats } from '../DataProviders/Models/Stats';
import { Command } from '../Structures/Command';

export class StatsCommand extends Command
{
	private readonly props: ['number' | 'string' | 'object'] = ['number', 'string', 'object'];

	public async run(msg: Message, [name]: string[]): Promise<Message>
	{
		const stats: Stats = await Stats.findById<Stats>(name);

		if (!stats)
		{
			return msg.edit('Could not find the specified entry in the database.');
		}

		for (const prop of this.props)
		{
			if (prop === undefined) continue;
			else if (prop !== 'object') return msg.edit(`${name[0].toUpperCase() + name.slice(1)}: ${stats[prop]}`);

			return msg.edit(`${name[0].toUpperCase() + name.slice(1)}\n\`\`\`xl\n${inspect(prop)}\`\`\``);
		}

		return msg.edit('The specified entry seems not to contain any data.');
	}
}
