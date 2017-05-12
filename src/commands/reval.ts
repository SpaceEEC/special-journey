import { stripIndents } from 'common-tags';
import { Collection, Message, TextChannel } from 'discord.js';

import SelfbotClient from '../structures/client';
import { Command, CommandInformations } from '../structures/command';

export default class RevalCommand extends Command {
	public constructor(client: SelfbotClient) {
		super(client, {
			name: 'REVAL',
			aliases: ['RAWAIT', 'RASYNC'],
		});
	}

	public async run(msg: Message, args: string[], info: CommandInformations): Promise<Message | Message[]> {
		const channel: TextChannel = this.client.channels.get(this.client.config.botChannelID) as TextChannel;

		await channel.send(`${info.alias.replace('r', this.client.config.botPrefix)} ${args.join(' ')}`);

		const fetched: Message = await channel.awaitMessages(
			(message: Message) => message.author.id === this.client.config.botID,
			{ time: 5000, maxMatches: 1 },
		).then((awaited: Collection<string, Message>) => awaited.first());

		if (!fetched) return msg.edit(`\u200b${msg.content}\n🕐.`);

		// magic
		const stuff: string[] = fetched.content.split('```js');

		if (stuff[2]) {
			return msg.edit(stripIndents`
			\u200b${msg.content}

			\`evaled\\returned:\` \`typeof: ${stuff[3].split('```')[0].slice(1)}\`
			\`\`\`js
			${stuff[2].split('```')[0]}
			\`\`\`
			Ausführungszeitraumslänge: \`${stuff[3].split(' `')[1][0]}\`ms
			`);
		}

		return msg.edit(stripIndents`
		\u200b${msg.content}

		\`E-ROHR\`
		\`\`\`js
		${stuff[1].split('```')[0]}
		\`\`\`
		Versuchungszeitraumslänge: \`${stuff[1].split(' `')[1][0]}\`ms`);
	}
}
