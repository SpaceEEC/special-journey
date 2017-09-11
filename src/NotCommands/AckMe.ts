import { Message } from 'discord.js';

import { AckMeCommandGroup } from '../Commands/AckMe/AckMe';
import { NotCommand } from '../Structures/NotCommand';

export class AckMeNotCommand extends NotCommand
{
	public async run(newMsg: Message, oldMsg: Message): Promise<Message>
	{
		const msg: Message = oldMsg || newMsg;

		// since this runs all the time it should be compatible with both v11.2 and v12 of discord.js
		// at least for now
		if (typeof msg.mentions.has === 'function'
			? msg.mentions.has(msg.guild ? msg.guild.me : msg.author)
			: msg.isMemberMentioned(msg.guild ? msg.guild.me : msg.author)
		)
		{
			const commandGroup: AckMeCommandGroup = this.client.registry.getCommand<AckMeCommandGroup>('ACKME');
			const shouldAck: boolean = await commandGroup.has(msg.guild.id);
			if (shouldAck)
			{
				await commandGroup.increment();
				return msg.acknowledge();
			}
		}
	}
}
