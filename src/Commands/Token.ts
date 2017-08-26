import { DiscordAPIError, Message, User } from 'discord.js';
import { get, Result } from 'snekfetch';

import { Aliases, Command, CommandInformations } from '../Structures/Command';

const { BOT }: { [key: string]: string } = process.env;

@Aliases('ID')
export class TokenCommand extends Command
{
	private _idPattern: RegExp = new RegExp(/^\d{16,19}$/);

	public async run(msg: Message, [tokenOrId]: [string], { alias }: CommandInformations): Promise<Message>
	{
		const results: string[] = [];

		try
		{
			const user: User = await this._fetchUser(tokenOrId);

			results.push(`${user.tag} (${user.id}) (${user.bot ? 'Bot' : 'User'})`);

			if (alias === 'token')
			{
				results.push(await this._validateToken(tokenOrId, user));
			}

			return msg.edit(
				[
					`\u200b${msg.content}`,
					'```js',
					results.join('\n'),
					'```',
				],
			);
		}
		catch (error)
		{
			return msg.edit(
				[
					`\u200b${msg.content}`,
					'```js',
					results.join('\n'),
					error instanceof DiscordAPIError ? `${error.code}${error.message}\n${(error as any).path}` : error,
					'```',
				],
			);
		}
	}

	private async _fetchUser(input: string): Promise<User>
	{
		let id: string;
		if (this._idPattern.test(input))
		{
			id = input;
		}
		else
		{
			id = Buffer.from(input.split('.')[0], 'base64').toString();
			if (!this._idPattern.test(id))
			{
				throw new Error(`"${input}" -> "${id}" does not look like a valid snowflake.`);
			}
		}

		const data: any = await get(`https://discordapp.com/api/v7/users/${id}`)
			.set('Authorization', `Bot ${BOT}`)
			.then<any>((result: Result) => result.body);

		return new User(this.client, data);
	}

	private async _validateToken(token: string, { bot, id }: User): Promise<string>
	{
		if (bot)
		{
			const data: any = await get(`https://discordapp.com/api/v7/oauth2/applications/@me`)
				.set('Authorization', `Bot ${token}`)
				.then((res: Result) => res.body)
				.catch(() => null);

			if (!data)
			{
				return 'Error: Invalid token';
			}

			if (!data.owner)
			{
				return 'Valid token';
			}

			const owner: User = new User(this.client, data.owner);
			return `'Valid token'\nOwner ${owner.tag} (${owner.id})\n`
				+ this.client.users.has(owner.id) ? 'Cached' : 'Not cached';
		}

		const response: any = await get(`https://discordapp.com/api/v7/users/${id}`)
			.set('Authorization', token)
			.catch(() => null);

		return response
			? 'Valid token'
			: 'Error: Invalid token';
	}
}
