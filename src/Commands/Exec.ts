import { exec } from 'child_process';
import { Message } from 'discord.js';
import { promisify } from 'util';

import { Command } from '../Structures/Command';

const execAsync: (command: string) => Promise<{ stdout: string, stderr: string }> = promisify(exec);

export class ExecCommand extends Command
{
	public async run(msg: Message, args: string[]): Promise<Message>
	{
		await msg.edit(`\u200b${msg.content}\n\n...`);

		const { stdout, stderr }: { stdout: string, stderr: string } = await execAsync(args.join(' '));

		return msg.edit(
			[
				'`EXEC`',
				'```xl',
				args.join(' '),
				'```',
				stdout || (!stderr && !stdout) ? `\`STDOUT\`\n\`\`\`xl\n${stdout || 'Nothing at all'}\`\`\`` : '',
				stderr ? `\`STDERR\`\`\`\`xl${stderr}\`\`\`` : '',
			],
		);
	}
}
