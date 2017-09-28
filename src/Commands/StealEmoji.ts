import { Emoji, Message } from 'discord.js';

import { Aliases, Command } from '../Structures/Command';

const { HOMEGUILD }: { [key: string]: string } = process.env;

@Aliases('STEAL')
export class StealEmojiCommand extends Command
{
	public async run(msg: Message, [input, name]: string[]): Promise<Message>
	{
		if (!input) return msg.edit('No input provided.');

		let url: string;

		if (/^\d{16,21}$/.test(input))
		{
			input = await msg.channel.messages.fetch(input)
				.then((m: Message) => m.content);
		}

		const match: string[] = input.match(/<:([a-zA-Z0-9_]+):(\d+)>/);
		if (match)
		{
			url = (this.client as any).rest.cdn.Emoji(match[2]);
			name = match[1];
		}
		else
		{
			if (!name)
			{
				await msg.react('❌');
				return;
			}

			url = input;
		}

		const emoji: Emoji = await this.client.guilds.get(HOMEGUILD).createEmoji(url, name);

		return msg.edit(emoji.toString());
	}
}
