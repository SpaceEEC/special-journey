import { Client as DJSClient, ClientOptions, Collection, Message } from 'discord.js';
import { readdir } from 'fs';
import { join, parse, ParsedPath } from 'path';
import { promisify } from 'util';

import { Database } from '../DataProviders/Database';
import { ListenerUtil } from '../Types/ListenerUtils';
import { Command } from './Command';
import { CommandGroup } from './CommandGroup';
import { CommandRegistry } from './CommandRegistry';
import { EventCounter } from './EventCounter';
import { Loggable, Logger, LogLevel } from './Logger';
import { NotCommand } from './NotCommand';

const { PREFIX }: { [key: string]: string } = process.env;

const readdirAsync: (path: string) => Promise<string[]> = promisify(readdir);
const { on, once, registerListeners } = ListenerUtil;

/**
 * An extended discord.js client
 */
@Loggable
export class Client extends DJSClient
{
	/**
	 * The EventCounter of this client
	 * @readonly
	 */
	public readonly eventCounter: EventCounter = new EventCounter();
	/**
	 * Collection of "NotCommands", mapped by their names
	 * @readonly
	 */
	public readonly notCommands: Collection<string, NotCommand> = new Collection<string, NotCommand>();
	/**
	 * Command registry, holding all commands and command groups
	 * @readonly
	 */
	public readonly registry: CommandRegistry<Command | CommandGroup<any>>
	= new CommandRegistry<Command | CommandGroup<any>>(this, join(__dirname, '..', 'Commands'));

	/**
	 * Reference to the logger singleton instance
	 * @private
	 * @readonly
	 */
	private readonly logger: Logger;

	/**
	 * Instantiates a new Client.
	 * @param {ClientOptions} [options] Options for a client.
	 */
	public constructor(options?: ClientOptions)
	{
		super(options);

		this.logger.setLogLevel(LogLevel.SILLY);

		Database.start();

		this.registry.init();
		this.loadNotCommands();

		registerListeners(this);
	}

	// Event methods are protected and not private because ts would yell at me because they are "unused".

	@on('messageUpdate')
	@on('message', null)
	protected async onMessage(originalMsg: Message, newMsg?: Message): Promise<void>
	{
		// ignore updated message with the same content (embed update or stuff)
		if (newMsg && newMsg.content === originalMsg.content) return;

		const msg: Message = newMsg || originalMsg;

		if (msg.author.id !== this.user.id) return this.handleNotCommand(newMsg || originalMsg, newMsg ? originalMsg : null);

		if (!msg.content.startsWith(PREFIX)) return;

		// tslint:disable-next-line:prefer-const I can't half const half let it here
		let [name, ...args]: string[] = msg.content.slice(PREFIX.length).split(/ +/);

		let command: Command<any> | CommandGroup<any> = this.registry.resolveCommand(msg, name, args);

		if (command instanceof CommandGroup)
		{
			command = command.resolveCommand(msg, name, args);
			name = args.shift();
		}

		if (!command) return;

		try
		{
			await command.run(msg, args, { alias: name });
		}
		catch (error)
		{
			this.logger.error(`[COMMAND][${name}]`, error);
		}

	}

	@once('ready')
	protected onceReady(): void
	{
		(this as any).ws.connection
			.on('close', (event: any) =>
				this.logger.warn('[DJS][DISCONNECT]', event.code, event.reason || 'No reason'),
		)
			.on('debug', (error: Error) =>
				this.logger.error('[DJS][WS]', error),
		);
	}

	@on('ready')
	protected onReady(): void
	{
		this.user.setAFK(true);
		this.logger.info('[DJS][READY]', 'Logged in as', this.user.tag);
	}

	@on('reconnecting')
	protected onReconnecting(): void
	{
		this.logger.warn('[DJS][RECONNECTINIG]');
	}

	@on('warn')
	protected onWarn(...args: any[]): void
	{
		this.logger.warn('[DJS][WARN]', ...args);
	}

	@on('error')
	protected onError(...args: any[]): void
	{
		this.logger.error('[DJS][ERROR]', ...args);
	}

	@on('resumed') // 12
	@on('resume') // 11.2
	protected onResume(replayed: number): void
	{
		this.logger.info('[DJS][RESUMED]', `Replayed ${replayed} events.`);
	}

	@on('raw')
	protected onRaw(packet: any): void
	{
		this.eventCounter.trigger(packet.t || packet.op);
	}

	@on('debug')
	protected onDebug(message: string): void
	{
		if (message.startsWith('Authenticated using token')
			|| message.startsWith('[ws] [connection] Heartbeat acknowledged,')
			|| message === '[ws] [connection] Sending a heartbeat')
		{
			return;
		}

		this.logger.debug('[DJS][DEBUG]', message);
	}

	private async loadNotCommands(): Promise<void>
	{
		const files: string[] = await readdirAsync(join(__dirname, '..', 'NotCommands'));

		for (const file of files)
		{
			const { ext, name }: ParsedPath = parse(file);
			if (ext !== '.js') continue;

			const notCommandClass: typeof NotCommand = require(`../NotCommands/${file}`)[`${name}NotCommand`];

			if (!notCommandClass) throw new Error(`${file}'s export is falsy!`);

			if (!(notCommandClass.prototype instanceof NotCommand))
			{
				throw new Error(`${file}'s export's prototype is not instanceof NotCommand!`);
			}

			const notCommand: NotCommand = new notCommandClass(this);

			this.notCommands.set(notCommand.filename, notCommand);
			this.logger.info('[CLIENT][REGISTRY]', 'Loaded not command:', notCommand.filename);
		}
	}

	private handleNotCommand(msg: Message, oldMsg?: Message): void
	{
		for (const notCommand of this.notCommands.values())
		{
			notCommand.run(msg, oldMsg);
		}
	}
}
