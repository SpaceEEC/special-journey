import { stripIndents } from 'common-tags';
import { Message, User } from 'discord.js';
import { get, Result } from 'snekfetch';

import { SelfbotClient } from '../structures/client';
import { Command, CommandInformations } from '../structures/command';

export default class TokenCommand extends Command {
	private readonly _regex: RegExp;

	public constructor(client: SelfbotClient) {
		super(client, {
			aliases: ['ID'],
			name: 'TOKEN',
		});
		this._regex = new RegExp(/\D/, 'g');
	}

	public async run(msg: Message, args: string[], info: CommandInformations): Promise<Message | Message[]> {
		let url: string;
		let auth: string;
		try {
			if (info.alias === 'token') {
				url = 'https://discordapp.com/api/v7/users/@me';
				auth = args.join(' ');
			} else {
				let id: string = Buffer.from(args[0].split('.')[0], 'base64').toString();
				if (this._regex.test(id)) {
					if (this._regex.test(args[0])) throw String('Not even remotely a snowflake.');
					else id = args[0];
				}
				url = `https://discordapp.com/api/v7/users/${id}`;
				auth = `Bot ${this.client.config.botToken}`;
			}

			const user: User = await get(url)
				.set('Authorization', auth)
				// not always a buffer
				.then<User>((result: Result) => result.body as any);
			return msg.edit(stripIndents`
			\u200b${msg.content}
			\`\`\`js
			${user.username}#${user.discriminator} (${user.id})
			\`\`\`
			`);
		} catch (err) {
			return msg.edit(stripIndents`
			\u200b${msg.content}
			\`\`\`js
			${err.url ? `${err.status} ${err.statusText}\n${err.text}` : err}
			\`\`\`
			`);
		}
	}
}
