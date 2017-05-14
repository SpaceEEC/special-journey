// tslint:disable:no-eval
import { stripIndents } from 'common-tags';
import { Message, Util } from 'discord.js';
import { inspect } from 'util';

import SelfbotClient from '../structures/client';
import { Command, CommandInformations } from '../structures/command';

export default class EvalCommand extends Command {
	/** The depth to inspect with */
	private _inspect: number;
	/** Whether errors should be logged */
	private _log: boolean;
	/** Whether an error stack should be output */
	private _stack: boolean;
	/** Temp value to save between evals */
	private _test: any;

	public constructor(client: SelfbotClient) {
		super(client, {
			name: 'EVAL',
			aliases: ['ASYNC', 'AWAIT', 'SILE'],
		});
		this._inspect = 0;
		this._log = false;
		this._stack = false;
		this._test = null;
	}

	public async run(msg: Message, args: string[], info: CommandInformations): Promise<Message | Message[]> {
		const startTime = process.hrtime();

		let code: string = args.join(' ');
		if (code.includes('`E-ROHR`')) code = code.slice(0, code.indexOf('`E-ROHR`')).trim();
		if (code.includes('`evaled\\returned:`')) code = code.slice(0, code.indexOf('`evaled\\returned:`')).trim();

		try {
			let evaled: any;
			if (info.alias === 'async') evaled = Promise.resolve(eval(`(async()=>{${code}})();`));
			else evaled = Promise.resolve(eval(code));

			if (info.alias === 'sile') return msg.edit(`\u200b${this.client.config.prefix + info.alias} ${code}`);
			if (info.alias !== 'await') evaled = await evaled;

			const typeofEvaled: string = typeof evaled;

			if (typeof evaled !== 'string') evaled = inspect(evaled, false, this._inspect);
			if (evaled.includes(this.client.token)) {
				return msg.edit(`\u200b${this.client.config.prefix + info.alias} ${code}\n\n¯\\_(ツ)_/¯`);
			}

			await msg.edit(stripIndents`
			\u200b${this.client.config.prefix + info.alias} ${code}

			\`evaled\\returned:\` \`typeof: ${typeofEvaled}\`
			\`\`\`js\n${Util.escapeMarkdown(evaled, true)}\n\`\`\`
			Ausführungszeitraumslänge: \`${process.hrtime(startTime)} \`ms`);
		} catch (err) {
			if (!err) return msg.edit(`\u200b${this.client.config.prefix + info.alias} ${code}\nE-Rohr, but no error.`)
				.catch(() => null);
			if (this._log) this.logger.error('evaled', err);
			msg.edit(stripIndents`
			\u200b${this.client.config.prefix + info.alias} ${code}

			\`E-ROHR\`
			\`\`\`js
			${Util.escapeMarkdown(this._stack ? inspect(err, false, this._inspect) : err.message, true)}
			\`\`\`
			Versuchungszeitraumslänge: \`${process.hrtime(startTime)} \`ms`).catch(() => null);
		}
	}
}
