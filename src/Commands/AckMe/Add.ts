import { Guild, Message } from 'discord.js';

import { Command } from '../../Structures/Command';
import { AckMeCommandGroup } from './AckMe';

export class AddCommand extends Command<AckMeCommandGroup>
{
	public async run(msg: Message, [id]: [string]): Promise<Message>
	{
		if (!id) return msg.edit('A guild ID might be of use here.');

		let guild: Guild = this.client.guilds.get(id);

		if (!guild)
		{
			if (id !== 'this') return msg.edit('No such guild found.');

			guild = msg.guild;
			id = msg.guild.id;
		}

		if (!await this.group.add(id)) return msg.edit(`${guild.name} is already on the acking list.`);

		return msg.edit(`Added ${guild.name} to the acking list`);
	}
}
