import { Message } from 'discord.js';

import { Aliases, Command } from '../Structures/Command';

@Aliases('CB')
export class CodeBlockCommand extends Command
{
	private _codeBlock: RegExp = /```(.+)\n/g;

	public async run(msg: Message, [id]: [string]): Promise<Message>
	{
		if (!id) return msg.edit('A message id might be of use here.');

		const fetched: Message = await msg.channel.messages.fetch(id).catch(() => null);

		if (!fetched) return msg.edit('Could not find the provided message.');

		const found: string[] = [];
		let match: string[];
		// tslint:disable-next-line:no-conditional-assignment
		while ((match = this._codeBlock.exec(fetched.content)))
		{
			found.push(match[1]);
		}

		if (!found.length) return msg.edit('Could not find any codeblocks in the provided message.');

		return msg.edit(found.join('\n'));
	}
}
