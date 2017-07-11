import { Message, RichEmbed } from 'discord.js';
import { get, Result } from 'snekfetch';

import { SelfbotClient } from '../structures/client';
import { Command } from '../structures/command';
import { JishoAPIResponse, JishoData } from '../types/JishoAPIResponse';

export default class JishoCommand extends Command
{
	public constructor(client: SelfbotClient)
	{
		super(client,
			{
				aliases: ['J'],
				name: 'JISHO',
			},
		);
	}

	public async run(msg: Message, args: string[]): Promise<Message | Message[]>
	{
		if (!args[0]) return;

		let definition: number = 0;
		if (args[0].match(/^-\d+$/))
		{
			definition = parseInt(args.splice(0, 1)[0].substr(1));
		}

		const response: JishoAPIResponse = await get(
			`http://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(args.join(' '))}`,
		).then<JishoAPIResponse>((result: Result) => result.body as any);

		if (response.meta.status !== 200)
		{
			return msg.edit(`\u200b${msg.content}\nServer responded with **${response.meta.status}**, exptected **200**.`);
		}

		const data: JishoData = response.data[definition];
		const common: string = data.is_common ? 'common word\n' : '';
		let senses: string = '';

		let i: number = 0;
		for (const sense of data.senses)
		{
			if (sense.parts_of_speech)
			{
				senses += `${sense.parts_of_speech.join('; ')}\n`;
			}
			if (sense.english_definitions)
			{
				senses += `${++i}. ${sense.english_definitions.join('; ')}`;
			}

			if (data.senses.length !== i)
			{
				senses += '\n\n';
			}
		}

		const embed: RichEmbed = new RichEmbed()
			.setColor(0x56D926)
			.setFooter(`Result ${definition + 1} from ${response.data.length}`,
			'http://assets.jisho.org/assets/favicon-062c4a0240e1e6d72c38aa524742c2d558ee6234497d91dd6b75a182ea823d65.ico')
			.addField('Definition', `${data.japanese[0].reading}\n${data.japanese[0].word}\n${common}`, true)
			.addField('\u200b', senses, true);

		return msg.edit({ embed });
	}
}
