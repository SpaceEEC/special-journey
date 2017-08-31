import { Message, MessageReaction } from 'discord.js';

import { Tag } from '../../DataProviders/Models/Tag';
import { Aliases, Command, CommandInformation } from '../../Structures/Command';
import { TagCommandGroup } from './Tag';

@Aliases('ADD', 'ADDI', 'ADDIMAGE')
export class AddTagCommand extends Command<TagCommandGroup>
{
	public async run(msg: Message, [name, ...args]: string[], { alias }: CommandInformation): Promise<MessageReaction>
	{
		if (!name || !args.length) return msg.react('❌');

		const already: Tag = await Tag.findOne<Tag>({ where: { name } });

		if (already) return msg.react('❌');

		await Tag.create({
			content: alias === 'add' ? args.join(' ') : args.slice(1).join(' '),
			image: alias === 'add' ? null : args[0],
			name: name.toLowerCase(),
		});

		return msg.react('✔');
	}
}
