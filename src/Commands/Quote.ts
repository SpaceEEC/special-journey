import {
	Channel,
	DMChannel,
	GroupDMChannel,
	Message,
	MessageAttachment,
	RichEmbed,
	TextChannel,
	Util,
} from 'discord.js';
import * as moment from 'moment';

import { Aliases, Command } from '../Structures/Command';
import { Loggable } from '../Types/LoggerDecorator';

// temporary workaround
const { MessageEmbed }: { MessageEmbed: typeof RichEmbed } = require('discord.js');
type MessageEmbed = RichEmbed;

type TextBasedChannel = TextChannel | GroupDMChannel | DMChannel;

@Aliases('Q')
@Loggable('[QUOTE]')
export class QuoteCommand extends Command
{
	public async run(msg: Message, args: string[]): Promise<Message>
	{
		try
		{
			let color: number = this._resolveColor(args);
			const channel: TextBasedChannel = this._resolveChannel(args) || msg.channel;

			const fetched: Message = await channel.messages.fetch(args.shift());

			if (!color)
			{
				if (!fetched.member && fetched.guild)
				{
					fetched.member = await fetched.guild.members.fetch(fetched.author)
						// people can leave guilds
						.catch(() => null);

					if (fetched.member) color = fetched.member.displayColor;
				}
			}

			const embed: MessageEmbed = this._generateEmbed(msg, fetched)
				.setAuthor(fetched.author.tag, fetched.author.displayAvatarURL())
				.setColor(color)
				.setDescription(fetched.content)
				.setFooter(moment(fetched.createdTimestamp).utc().fromNow());

			let response: string = '\u200b';
			for (const id of args)
			{
				if (!Number(id))
				{
					response += args.slice(args.indexOf(id)).join(' ');
					break;
				}

				const add: Message = await channel.messages.fetch(id);
				embed.addField(add.author.tag, add.content.slice(0, 1024));
			}

			if (!embed.fields.length)
			{
				const fetchedEmbed: MessageEmbed = fetched.embeds[0] as any;
				if (fetchedEmbed && fetchedEmbed.thumbnail)
				{
					embed.setDescription(embed.description.replace(fetchedEmbed.thumbnail.url, ''))
						.setImage(fetchedEmbed.thumbnail.url);
				}
				else
				{
					const attachment: MessageAttachment = fetched.attachments.first();
					if (attachment && attachment.width)
					{
						embed.setImage(attachment.url);
					}
				}
			}

			await msg.edit(response, { embed });
		}
		catch (error)
		{
			if (error.message !== 'Message not found.') this.logger.error(error);
			return msg.edit(
				[
					`\u200b${msg.content}`,
					'',
					'',
					'`E-ROHR`',
					'',
					'```js',
					error + (error.text || ''),
					'```',
				],
			);
		}
	}

	/**
	 * Tries to resolve a color from the provided arguments.
	 * Upon failure 0 is returned.
	 * @param {string[]} args
	 * @returns {number}
	 * @private
	 */
	private _resolveColor(args: string[]): number
	{
		try
		{
			const color: number = Util.resolveColor(args[0]);
			args.shift();
			return color;
		}
		catch
		{
			return 0;
		}
	}

	/**
	 * Tries to resolve a specified channel, if one was specified but it was invalid an error will be thrown
	 * @param {string[]} args
	 * @returns {TextBasedChannel}
	 * @private
	 */
	private _resolveChannel(args: string[]): TextBasedChannel
	{
		if (args[0] === '-c')
		{
			const channel: Channel = this.client.channels.get(args[1]);
			if (!channel) throw new Error('Couldn\'t find a channel wit the specified id');
			args.splice(0, 2);
			return channel as TextBasedChannel;
		}

		return null;
	}

	/**
	 * Instantiates an new embed and sets a title if the channels of the messages differ.
	 * @param {Message} msg
	 * @param {Message} fetched
	 * @returns {RichEmbed}
	 * @private
	 */
	private _generateEmbed(msg: Message, fetched: Message): MessageEmbed
	{
		const embed: MessageEmbed = new MessageEmbed();

		// same channel, don't bother with anything else
		if (msg.channel.id === fetched.channel.id) return embed;

		// coming from a dm
		if (!(fetched.channel instanceof TextChannel))
		{
			return embed.setTitle('#DM');
		}
		// coming from a different guild
		else if (!msg.guild || msg.guild.id !== fetched.guild.id)
		{
			return embed.setTitle(`${fetched.guild.name} #${fetched.channel.name}`);
		}
		// coming from same guild and channel
		else if (msg.channel.id === fetched.channel.id)
		{
			return embed;
		}

		// coming from same guild but different channel
		return embed.setTitle(`#${fetched.channel.name}`);
	}
}
