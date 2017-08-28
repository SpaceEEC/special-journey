import { Guild, Message, Util } from 'discord.js';

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
			if (id !== 'this') return msg.edit('No guild with that id found.');

			guild = msg.guild;
			id = msg.guild.id;
		}

		if (!await this.group.add(id))
		{
			return msg.edit(`\`${Util.escapeMarkdown(guild.name, true)}\` is already on the acking list.`);
		}

		return msg.edit(`Added \`${Util.escapeMarkdown(guild.name, true)}\` to the acking list.`);
	}
}
