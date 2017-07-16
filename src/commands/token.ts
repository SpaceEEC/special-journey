import { stripIndents } from 'common-tags';
import { DiscordAPIError, Message, User } from 'discord.js';
import { get, Result } from 'snekfetch';

import { SelfbotClient } from '../structures/client';
import { Command, CommandInformations } from '../structures/command';

export default class TokenCommand extends Command
{
	private readonly _regex: RegExp;

	public constructor(client: SelfbotClient)
	{
		super(client,
			{
				aliases: ['ID'],
				name: 'TOKEN',
			},
		);

		this._regex = new RegExp(/^\d{16,19}$/);
	}

	public async run(msg: Message, args: string[], info: CommandInformations): Promise<Message | Message[]>
	{
		const results: string[] = [];

		try
		{
			const user: User = await this._fetchUser(args[0].split('.')[0]);

			results.push(`${user.username}#${user.discriminator} (${user.id}) ${user.bot ? '(Bot)' : '(User)'}`);

			if (info.alias === 'token')
			{
				results.push(await this._validateToken(args[0], user));
			}

			return msg.edit(stripIndents`
			\u200b${msg.content}
			\`\`\`js
			${results.join('\n')}
			\`\`\`
			`);

		}
		catch (error)
		{
			return msg.edit(stripIndents`
			\u200b${msg.content}
			\`\`\`js
			${results.join('\n')}
			${error instanceof DiscordAPIError ? `${error.code}${error.message}\n${(error as any).path}` : error}
			\`\`\`
			`);
		}
	}

	private _fetchUser(input: string): Promise<User>
	{
		let id: string = Buffer.from(input.split('.')[0], 'base64').toString();
		if (!this._regex.test(id))
		{
			if (!this._regex.test(input))
			{
				throw new Error(`"${input}" -> "${id}" does not look like a valid snowflake.`);
			}
			else
			{
				id = input;
			}
		}

		return get(`https://discordapp.com/api/v7/users/${id}`)
			.set('Authorization', `Bot ${this.client.config.botToken}`)
			.then<any>((result: Result) => result.body);
	}

	private async _validateToken(token: string, { bot, id }: User): Promise<string>
	{
		const valid: Result = await get(`https://discordapp.com/api/v7/users/${id}`)
			.set('Authorization', `${bot ? 'Bot ' : ''}${token}`)
			.catch(() => null);

		return valid ? 'Valid token' : 'Error: Invalid token';
	}
}
