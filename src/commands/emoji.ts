import { oneLine } from 'common-tags';
import { Emoji, Message } from 'discord.js';

import SelfbotClient from '../structures/client';
import { Command } from '../structures/command';

export default class AliveCommand extends Command {
	public constructor(client: SelfbotClient) {
		super(client, {
			name: 'EMOJI'
		});
	}

	public async run(msg: Message, args: string[]): Promise<Message | Message[]> {
		const emoji: Emoji = this.client.emojis.get(args[0])
			|| this.client.emojis.find('name', args[0])
			|| this.client.emojis.find((value: Emoji) => value.name.toUpperCase() === args[0].toUpperCase());
		if (!emoji) return msg.edit(`\u200b${msg.content}\nNot found.`);

		if (args[1] === 'show') return msg.edit(args.slice(2).join(' '), { embed: { description: emoji.toString() } });

		return msg.edit(oneLine`
		Emoji \`${emoji.toString()}\` found in
		\`${emoji.guild.name}\` - <#${emoji.guild.id}>`,
			{ embed: { description: emoji.toString() } }
		);
	}
}
