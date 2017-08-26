import { Message } from 'discord.js';

import { Command } from '../Structures/Command';

export class CodeBlockCommand extends Command
{
	private _codeBlock: RegExp = /```(.+)\n/g;

	public async run(msg: Message, [id]: [string]): Promise<Message>
	{
		if (!id) return msg.edit('A message id might be of use here.');

		const fetched: Message = await msg.channel.messages.fetch(id).catch(() => null);

		if (!fetched) return msg.edit('No message with that id found.');

		let result: string = 'Codeblocks:\n';
		let found: boolean = false;
		let match: string[];
		// tslint:disable-next-line:no-conditional-assignment
		while ((match = this._codeBlock.exec(fetched.content)))
		{
			if (!found) found = true;
			result += `\`${match[1]}\`\n`;
		}

		if (!found) result = 'No codeblocks found in the provided message';

		return msg.edit(result);
	}
}
