import { Message } from 'discord.js';

import { Tag } from '../../DataProviders/Models/Tag';
import { Aliases, Command } from '../../Structures/Command';
import { TagCommandGroup } from './Tag';

@Aliases('SHOW', 'LIST')
export class ShowTagsCommand extends Command<TagCommandGroup>
{
	public async run(msg: Message): Promise<Message>
	{
		const tags: Tag[] = await Tag.findAll<Tag>();

		let content: string = '';
		for (const tag of tags)
		{
			content += `${tag.name} :: ${tag.content ? `${tag.content} ` : ''}${tag.image ? `(${tag.image})` : ''}\n`;
		}

		return msg.edit(content, { code: 'ldif' });
	}
}
