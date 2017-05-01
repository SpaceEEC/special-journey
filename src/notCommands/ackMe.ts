import { Message } from 'discord.js';
import { join } from 'path';

import SelfbotClient from '../structures/client';
import NotCommand from '../structures/notCommand';

export default class AckMe extends NotCommand {
	private readonly _ackMe: Set<string>;
	public constructor(client: SelfbotClient) {
		super(client);
		this._ackMe = this.client.data.get<Set<string>>('ackMe');
	}
	public async run(msg: Message, oldMsg: Message): Promise<void> {
		if (oldMsg || !msg.guild || !this._ackMe.has(msg.guild.id)) return;

		await msg.guild.acknowledge();
	}
}
