import { stripIndents } from 'common-tags';
import { Message, SnowflakeUtil } from 'discord.js';

import { SelfbotClient } from '../structures/client';
import { Command } from '../structures/command';
import { Util } from '../util';

export default class SnowflakeCommand extends Command {
	public constructor(client: SelfbotClient) {
		super(client, {
			aliases: ['SNOW'],
			name: 'SNOWFLAKE',
		});
	}

	public async run(msg: Message, args: string[]): Promise<Message | Message[]> {
		if (!args[0]) return msg.edit(`\u200b${msg.content} ${SnowflakeUtil.generate()}`);
		const date: string = Util.timeString(SnowflakeUtil.deconstruct(args[0]).date);
		return msg.edit(stripIndents`
		\u200b${msg.content}
		\`\`\`LDIF
		Schneeflöckchenkreierungsdatum: ${date} [(CET)]
		\`\`\`
		`);
	}
}
