import { oneLine, stripIndents } from 'common-tags';
import { Message, SnowflakeUtil } from 'discord.js';
import { join } from 'path';

import SelfbotClient from '../structures/client';
import { Command, CommandOptions } from '../structures/command';
import Util from '../util';

export default class SnowflakeCommand extends Command {
	public constructor(client: SelfbotClient) {
		super(client, {
			name: 'SNOWFLAKE',
			aliases: ['SNOW']
		});
	}

	public async run(msg: Message, args: string[]): Promise<Message | Message[]> {
		if (!args[0]) return msg.edit(`\u200b${msg.content} ${SnowflakeUtil.generate()}`);
		const { date: d }: { date: Date } = SnowflakeUtil.deconstruct(args[0]);
		const date: string = oneLine`
		${Util.forceLength(d.getDate())}.${Util.forceLength(d.getMonth() + 1)}.${Util.forceLength(d.getFullYear())}
		${Util.forceLength(d.getHours())}:${Util.forceLength(d.getMinutes())}:${Util.forceLength(d.getSeconds())}`;
		return msg.edit(stripIndents`
		\u200b${msg.content}
		\`\`\`LDIF
		Schneeflöckchenkreierungsdatum: ${date} [(CET)]
		\`\`\`
		`);
	}
}
