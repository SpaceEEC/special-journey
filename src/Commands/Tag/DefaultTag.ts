import { Message, Util } from 'discord.js';

import { Tag } from '../../DataProviders/Models/Tag';
import { Command, CommandInformations } from '../../Structures/Command';
import { TagCommandGroup } from './Tag';

export class DefaultTagCommand extends Command<TagCommandGroup>
{
	public async run(msg: Message, args: string[], { alias: name }: CommandInformations): Promise<Message>
	{
		if (!name) return msg.edit('A name might be of use here.');

		const tag: Tag = await Tag.findById<Tag>(name.toLowerCase());

		if (!tag) return msg.edit('No such tag found.');

		if (tag.image)
		{
			return msg.edit(args.join(' '),
				{
					embed: {
						color: Util.resolveColor('RANDOM'),
						description: tag.content,
						image:
						{
							url: tag.image,
						},
					},
				},
			);
		}

		return msg.edit(args.join(' ') + tag.content);
	}
}
