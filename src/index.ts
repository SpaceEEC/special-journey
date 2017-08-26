import { Client } from './Structures/Client';
import { Logger } from './Structures/Logger';

const { TOKEN }: { [key: string]: string } = process.env;

process.on('unhandledRejection', (error: Error) => Logger.instance.error('[Unhandled Rejection]', error));

const client: Client = new Client({ disableEveryone: true });
client.login(TOKEN).catch((error: Error) => Logger.instance.error('[DJS] [LOGIN]', error));
