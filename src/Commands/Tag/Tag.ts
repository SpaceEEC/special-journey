import { Message } from 'discord.js';

import { Command } from '../../Structures/Command';
import { CommandGroup } from '../../Structures/CommandGroup';
import { Directory } from '../../Types/CommandGroupDecorators';
import { Loggable } from '../../Types/LoggerDecorator';

@Loggable('[GROUP][TAG]')
@Directory(__dirname)
export class TagCommandGroup extends CommandGroup<TagCommandGroup>
{
	/**
	 * Resolves to a specific sub command or to the default one of none was found
	 * @param {message} msg
	 * @param {string[]} params
	 * @returns {[Command<U>, string, string[]]}
	 */
	public resolveCommand<U extends CommandGroup<TagCommandGroup>>(msg: Message, [name, ...args]: string[])
		: [Command<U>, string, string[]]
	{
		if (!name) return [this._commands.get('DEFAULTTAG') as Command<U>, name, args];

		const command: Command<U> = this._commands.get(name.toUpperCase()) as Command<U>
			|| this._commands.get(this._aliases.get(name.toUpperCase())) as Command<U>;

		return [command || this._commands.get('DEFAULTTAG') as Command<U>, name, args];
	}
}
