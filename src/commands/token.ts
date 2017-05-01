import { stripIndents } from 'common-tags';
import { Message, User } from 'discord.js';
import { join } from 'path';

import SelfbotClient from '../structures/client';
import { Command, CommandInformations } from '../structures/command';

const { get }: { get: any } = require('snekfetch');

export default class TokenCommand extends Command {
	private readonly _regex: RegExp;

	public constructor(client: SelfbotClient) {
		super(client, {
			name: 'TOKEN',
			aliases: ['ID']
		});
		this._regex = new RegExp(/\D/, 'g');
	}

	public async run(msg: Message, args: string[], info: CommandInformations): Promise<Message | Message[]> {
		let url: string;
		let auth: string;
		try {
			if (info.alias === 'token') {
				url = 'https://discordapp.com/api/v6/users/@me';
				auth = args.join(' ');
			} else {
				let id = Buffer.from(args[0].split('.')[0], 'base64').toString();
				if (this._regex.test(id)) {
					if (this._regex.test(args[0])) throw String('Not even remotely a snowflake.');
					else id = args[0];
				}
				url = `https://discordapp.com/api/v6/users/${id}`;
				auth = `Bot ${this.client.config.botToken}`;
			}

			const { body: user }: { body: User } = await get(url)
				.set('Authorization', auth);
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