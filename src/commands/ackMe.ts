import { oneLine } from 'common-tags';
import { Message } from 'discord.js';
import { writeFile } from 'fs';
import { join } from 'path';
import { error } from 'winston';

import SelfbotClient from '../structures/client';
import { Command } from '../structures/command';

export default class AliveCommand extends Command {
	private readonly _ackMe: Set<string>;
	public constructor(client: SelfbotClient) {
		super(client, {
			name: 'ACKME',
			aliases: ['ACK']
		});
		this._ackMe = client.data.get<Set<string>>('ackMe');
	}

	public async run(msg: Message, args: string[], { alias }: { alias: string }): Promise<Message | Message[]> {
		if (args[0] === 'this') args[0] = msg.guild.id;
		else if (args[1] === 'this') args[1] = msg.guild.id;

		if (args[0] === 'add') {
			if (!this.client.guilds.has(args[1])) {
				return msg.edit(`\u200b${this.client.config.prefix + alias}\nNo such guild.`);
			}

			if (this._ackMe.has(args[1])) {
				return msg.edit(`\u200b${this.client.config.prefix + alias}\nAlready on the list.`);
			}

			this._ackMe.add(args[1]);
		} else if (args[0] === 'remove') {
			if (!this.client.guilds.has(args[1])) {
				return msg.edit(`\u200b${this.client.config.prefix + alias}\nNo such guild.`);
			}

			if (!this._ackMe.has(args[1])) {
				return msg.edit(`\u200b${this.client.config.prefix + alias}\nNot on the list.`);
			}

			this._ackMe.delete(args[1]);
		} else if (args[0] === 'show') {
			const guilds: string[] = [];

			for (const id of this._ackMe.values()) {
				const guild = this.client.guilds.get(id);

				if (!guild) {
					this._ackMe.delete(id);
					continue;
				}

				guilds.push(`${id} | ${guild.name}`);
			}

			return msg.edit(`Guilds to ack:\n${guilds.join('\n')}`);
		} else if (this.client.guilds.has(args[0])) {
			const guild = this.client.guilds.get(args[0]);

			return msg.edit(oneLine`
			\u200b${this.client.config.prefix + alias}
			 | ${guild.name}: ${this._ackMe.has(args[0])
					? 'is on the list' : 'is not on the list'}`);
		} else {
			return msg.edit(`\u200b${this.client.config.prefix + alias} ${args[0]} - Not found.`);
		}
	}
}
