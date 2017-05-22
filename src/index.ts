import { SelfbotClient } from './structures/client';
import { Logger } from './structures/logger';

const client: SelfbotClient = new SelfbotClient();
client.login(client.config.token);

process.on('unhandledRejection', (err: any) =>
	Logger.instance.error('unhandledRejection:', err)
);
