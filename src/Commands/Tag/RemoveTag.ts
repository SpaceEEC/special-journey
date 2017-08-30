import { Message, MessageReaction } from 'discord.js';

import { Tag } from '../../DataProviders/Models/Tag';
import { Aliases, Command } from '../../Structures/Command';
import { TagCommandGroup } from './Tag';

@Aliases('DEL', 'DELETE', 'REMOVE', 'RM')
export class RemoveTagCommand extends Command<TagCommandGroup>
{
	public async run(msg: Message, [name]: string[]): Promise<MessageReaction>
	{
		if (!name) return msg.react('❌');

		const tag: Tag = await Tag.findOne<Tag>({ where: { name: name.toLowerCase() } });

		if (!tag) return msg.react('❌');

		await tag.destroy();

		return msg.react('✔');
	}
}
