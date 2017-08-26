import { Guild, Message } from 'discord.js';

import { Aliases, Command } from '../../Structures/Command';
import { AckMeCommandGroup } from './AckMe';

@Aliases('LIST')
export class ShowCommand extends Command<AckMeCommandGroup>
{
	public async run(msg: Message): Promise<Message>
	{
		const cache: Set<string> = await this.group.getCache();

		if (!cache.size) return msg.edit('The acking list is currently empty.');

		let mappedGuilds: string = 'The following guilds are on the acking list:```ldif\n';

		for (const id of cache)
		{
			const guild: Guild = this.client.guilds.get(id);
			if (!guild) continue;

			mappedGuilds += `${guild.id} || ${guild.name}\n`;
		}

		mappedGuilds = `${mappedGuilds.slice(0, -1).slice(0, 1997)}\`\`\``;

		return msg.edit(mappedGuilds);
	}
}
