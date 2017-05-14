import { oneLineTrim } from 'common-tags';
import { Message, RichEmbed, TextChannel } from 'discord.js';
import { join } from 'path';

import SelfbotClient from '../structures/client';
import { Command } from '../structures/command';

const { homepage }: { homepage: string } = require(join(__dirname, '..', '..', 'package.json'));

export default class QuoteCommand extends Command {
	public constructor(client: SelfbotClient) {
		super(client, {
			name: 'QUOTE',
			aliases: ['Q'],
		});
	}

	public async run(msg: Message, args: string[]): Promise<Message | Message[]> {
		try {
			let color: number = this._getColor(args);
			const channel: TextChannel = this._getChannel(args) || msg.channel as TextChannel;
			let response: string = '\u200b';

			const fetched: Message = await channel.fetchMessage(args.shift());

			fetched.member = channel.guild && await channel.guild.fetchMember(fetched.author).catch(() => null);
			if (!color && fetched.member) color = fetched.member.displayColor;

			const embed: RichEmbed = this._maybeSetTitle(msg, fetched)
				.setAuthor(`${fetched.member
					? fetched.member.displayName
					: fetched.author.username} ${this._timeString(msg.createdTimestamp - fetched.createdTimestamp)}`,
				fetched.author.displayAvatarURL,
				homepage)
				.setColor(color)
				.setDescription(fetched.content);

			for (const id of args) {
				if (!parseInt(id)) {
					response += args.slice(args.indexOf(id)).join(' ');
					break;
				}

				const add = await channel.fetchMessage(id);
				add.member = channel.guild && await channel.guild.fetchMember(add.author).catch(() => null);
				embed.addField(`${add.member
					? add.member.displayName
					: add.author.username} ${this._timeString(msg.createdTimestamp - fetched.createdTimestamp)}`,
					add.content);
			}

			if (!embed.fields.length) {
				const fetchedEmbed = fetched.embeds[0];
				if (fetchedEmbed && fetchedEmbed.thumbnail) {
					embed.setDescription(embed.description.replace(fetchedEmbed.thumbnail.url, ''));
					embed.setImage(fetchedEmbed.thumbnail.url);
				} else {
					const attachment = fetched.attachments.first();
					if (attachment && attachment.width) {
						embed.setImage(attachment.url);
					}
				}
			}

			await msg.edit(response, { embed });
		} catch (err) {
			if (err.message !== 'Message not found.') this.logger.error('quote', err);
			return msg.edit(`\u200b${msg.content}\n\n\`E-ROHR\`\n\`\`\`js\n${err}${err.text || ''}\n\`\`\``);
		}
	}

	/**
	 * Tries to resolve a color from the provided arguments.
	 * @param {string[]} args The args obtained from caller
	 * @returns {number}
	 * @private
	 */
	private _getColor(args: string[]): number {
		let color;
		try {
			color = (this.client as any).resolver.resolveColor(args[0].toUpperCase());
			args.shift();
		} catch (e) { color = 0; }
		return color;
	}

	/**
	 * Determins whether a channel has been specified and returns their object.
	 * @param {string[]} args The args obtained from caller
	 * @returns {?TextChannel}
	 * @private
	 */
	private _getChannel(args: string[]): TextChannel {
		if (args[0] === '-c') {
			const channel = this.client.channels.get(args[1]);
			args = args.splice(0, 2);
			return channel as TextChannel;
		} else { return null; }
	}

	/**
	 * Sets a title if the channel, quoting from, and the channel, quoting to, differs.
	 * @param {Message} msg Quoting message
	 * @param {Message} fetched Quoted message
	 * @returns {RichEmbed}
	 * @private
	 */
	private _maybeSetTitle(msg: Message, fetched: Message): RichEmbed {
		const embed: RichEmbed = new RichEmbed();
		if (!(fetched.channel instanceof TextChannel)) {
			if (msg.channel.id === fetched.channel.id) return embed;
			else return embed.setTitle('#DM');
		} else if (!msg.guild || msg.guild.id !== fetched.guild.id) {
			return embed.setTitle(`${fetched.guild.name} #${fetched.channel.name}`);
		} else {
			if (msg.channel.id === fetched.channel.id) return embed;
			else return embed.setTitle(`#${fetched.channel.name}`);
		}
	}

	/**
	 * Converts a number of milliseconds to a human readable string.
	 * @param {number} ms The amount of total milliseconds
	 * @returns {string} The final time string
	 * @private
	 */
	private _timeString(ms: number): string {
		const seconds: number = ms / 1000;
		const days: number = Math.floor(seconds / 86400);
		const hours: number = Math.floor(seconds % 86400 / 3600);
		const minutes: number = Math.floor(seconds % 3600 / 60);

		return oneLineTrim`
			${days >= 1 ? `${days}d ` : ''}
			${hours >= 1 ? `0${hours}h `.slice(-3) : ''}
			${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}m ago
		`;
	}
}
