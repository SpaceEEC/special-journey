import { Guild, Message } from 'discord.js';

import { Aliases, Command } from '../../Structures/Command';
import { AckMeCommandGroup } from './AckMe';

@Aliases('DELETE')
export class RemoveCommand extends Command<AckMeCommandGroup>
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

		if (!await this.group.remove(id)) return msg.edit(`${guild.name} was not on the acking list in the first place.`);

		return msg.edit(`Removed ${guild.name} from the acking list.`);
	}
}
