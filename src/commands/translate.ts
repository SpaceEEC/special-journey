import { Message, RichEmbed } from 'discord.js';
import { post, Result } from 'snekfetch';

import { SelfbotClient } from '../structures/client';
import { Command } from '../structures/command';
import { TranslateResponse } from '../types/SherlockTypes';

export default class TranslateCommand extends Command {
	private readonly _languages: RegExp;

	public constructor(client: SelfbotClient) {
		super(client, {
			aliases: ['T'],
			name: 'TRANSLATE',
		});
		this._languages = new RegExp(`-(${[
			'af', 'ar', 'bn', 'bg', 'zh', 'zh\\-cn', 'zh\\-tw',
			'cs', 'da', 'nl', 'en', 'tl', 'fi', 'fr', 'de',
			'el', 'hi', 'hu', 'id', 'ga', 'it', 'ja', 'ko',
			'la', 'ms', 'no', 'pl', 'pt', 'pa', 'ru', 'sk',
			'es', 'sv', 'th', 'tr', 'uk', 'vi', 'cy'].join('|')})\\s`, 'g');
	}

	public async run(msg: Message, args: string[]): Promise<Message | Message[]> {
		const [, to]: string[] = this._languages.exec(args.join(' ')) || [];
		const [, from]: string[] = this._languages.exec(args.join(' ')) || [];
		const query: string = args.slice(from ? 2 : 1).join(' ');

		if (!to) return msg.edit(`\u200b${msg.content}\nMissing or invalid language.`);

		const body: TranslateResponse = await post('https://api.kurisubrooks.com/api/translate')
			.set('Authorization', this.client.config.sherlock)
			.send({ query, to, from })
			// body is not always a buffer :c
			.then<TranslateResponse>((result: Result) => result.body as any)
			.catch((response: any) => response);

		let embed: RichEmbed;
		if (body.ok) {
			embed = new RichEmbed()
				.setColor(0xb89bf8)
				.addField(`From ${body.from.name} (${body.from.local})`, body.query)
				.addField(`To ${body.to.name} (${body.to.local})`, body.result);
		} else {
			embed = new RichEmbed()
				.setColor(0xff0000)
				.addField(`Error`, body.error);
		}

		return msg.edit('', { embed });
	}
}
