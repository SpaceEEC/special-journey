import { oneLine } from 'common-tags';
import { Message } from 'discord.js';
import { join } from 'path';
import { add, addColors, error, info, remove, transports } from 'winston';
import SelfbotClient from './structures/client';
import Util from './util';

addColors({ silly: 'magenta', debug: 'blue', verbose: 'cyan', info: 'green', warn: 'yellow', error: 'red' });
remove(transports.Console);
add(transports.Console, {
	level: 'silly',
	prettyPrint: true,
	colorize: true,
	silent: false,
	timestamp: (() => {
		const d: Date = new Date();
		return oneLine`
		${Util.forceLength(d.getDate())}.${Util.forceLength(d.getMonth() + 1)}.${Util.forceLength(d.getFullYear())}
		${Util.forceLength(d.getHours())}:${Util.forceLength(d.getMinutes())}:${Util.forceLength(d.getSeconds())}`;
	})
});

const client: SelfbotClient = new SelfbotClient();

process.on('unhandledRejection', (err: any) => {
	error('unhandledRejection:', err);
});
