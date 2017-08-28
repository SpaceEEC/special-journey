import * as Discord from 'discord.js';
import { inspect } from 'util';

import { Client } from '../Structures/Client';
import { Aliases, Command, CommandInformations } from '../Structures/Command';
import { Loggable } from '../Structures/Logger';

const { PREFIX }: { [key: string]: string } = process.env;

@Loggable('[EVAL]')
@Aliases('SILE')
export class EvalCommand extends Command
{
	/**
	 * The depth to inspect with
	 * @private
	 */
	private _inspect: number = 0;
	/**
	 * Whether errors should be logged
	 * @private
	 */
	private _log: boolean = false;
	/**
	 * Whether the output message of an error should contain a stack
	 * @private
	 */
	private _stack: boolean = false;
	/**
	 * Temp value to save betweene evals
	 * @private
	 */
	// tslint:disable-next:line:it-is-okay
	private _test: any = null;

	public async run(msg: Discord.Message, args: string[], { alias }: CommandInformations): Promise<Discord.Message>
	{
		const client: Client = this.client;
		const message: Discord.Message = msg;

		const startTime: [number, number] = process.hrtime();

		let code: string = args.join(' ');
		if (code.includes('`E-ROHR`')) code = code.slice(0, code.indexOf('`E-ROHR`')).trim();
		if (code.includes('`evaled\\returned:`')) code = code.slice(0, code.indexOf('`evaled\\returned:`')).trim();

		try
		{
			// tslint:disable-next-line:no-eval
			let evaled: any = await eval(
				code.includes('await')
					? `(async()=>{${code}})()`
					: code,
			);

			if (alias === 'sile') return msg.edit(`\u200b${PREFIX + alias} ${code}`);

			const typeofEvaled: string = evaled === null
				? 'null'
				: evaled
					&& evaled.constructor
					? evaled.constructor.name
					: typeof evaled;

			if (typeof evaled !== 'string')
			{
				evaled = inspect(evaled, { depth: this._inspect });
			}

			if (evaled.includes(this.client.token))
			{
				return msg.edit(`\u200b${PREFIX + alias} ${code}\n\n👀`);
			}

			const diff: [number, number] = process.hrtime(startTime);
			const diffString: string = diff[0] > 0 ? `\`${diff[0]}\`s` : `\`${diff[1] / 1e6}\`ms`;

			await msg.edit(
				[
					`\u200b${PREFIX + alias} ${code}`,
					'',
					`\`evaled\\returned:\` \`typeof: ${typeofEvaled}\``,
					'```js',
					Discord.Util.escapeMarkdown(evaled, true),
					'```',
					`Ausführungszeitraumslänge: ${diffString}`,
				],
			);
		}
		catch (error)
		{
			if (this._log) this.logger.error(null, error);

			const diff: [number, number] = process.hrtime(startTime);
			const diffString: string = diff[0] > 0 ? `\`${diff[0]}\`s` : `\`${diff[1] / 1e6}\`ms`;

			if (typeof error !== 'string')
			{
				error = this._stack
					? inspect(error, { depth: this._inspect })
					: String(error ? error.message : error);
			}

			msg.edit(
				[
					`\u200b${PREFIX + alias} ${code}`,
					'',
					'`E-ROHR`',
					'```js',
					Discord.Util.escapeMarkdown(error, true),
					'```',
					`Ausführungszeitraumslänge: ${diffString}`,
				],
			);
		}
	}
}
