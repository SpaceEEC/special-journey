import { exec } from 'child_process';
import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';

import SelfbotClient from '../structures/client';
import { Command } from '../structures/command';

type Execution = {
	/** Full error typings are overrated */
	error: any;
	stdout: string;
	stderr: string;
};

export default class ExecuteCommand extends Command {
	public constructor(client: SelfbotClient) {
		super(client, {
			name: 'EXEC',
		});
	}

	public async run(msg: Message, args: string[]): Promise<Message | Message[]> {
		await msg.edit(`\u200b${msg.content}\n...`);

		const { error, stdout, stderr }: Execution = await new Promise<Execution>(
			(resolve: (value: Execution) => void) => {
				// tslint:disable-next-line:no-shadowed-variable
				exec(args.join(' '), (error: any, stdout: string, stderr: string) =>
					resolve({ error, stdout, stderr }));
			});

		return msg.edit(stripIndents`
				\`EXEC\`${error && error.code ? `\`Error Code: ${error.code}\`` : ''}
				\`\`\`xl\n${args.join(' ')}\`\`\`${error && error.signal ? `\nSignal received: ${error.signal}` : ''}
				${stdout ? `\`STDOUT\`\n\`\`\`xl\n${stdout}\`\`\`` : ''}
				${stderr ? `\`STERR\`\n\`\`\`xl\n${stderr}\`\`\`` : ''}
				`);
	}
}
