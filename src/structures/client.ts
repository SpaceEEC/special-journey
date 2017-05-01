import { oneLine } from 'common-tags';
import { Client, ClientOptions, Collection, GuildMember, Message } from 'discord.js';
import { readdirSync } from 'fs';
import { extname, join } from 'path';
import { debug, error, info, warn } from 'winston';

import { Command, CommandInformations, CommandOptions } from './command';
import DataProvider from './dataProvider';
import EventCounter from './EventCounter';
//import Logger from './logger';
import NotCommand from './notCommand';

interface Config {
	botToken: string;
	prefix: string;
	token: string;
	sherlock: string;
	botID: string;
	botPrefix: string;
	botChannelID: string;
}

/** Represents a regular discord client with some stuff added to it. */
export default class SelfbotClient extends Client {
	/** The config of the client */
	public readonly config: Config;
	/** The Dataprovider of the client */
	public readonly data: DataProvider;
	/** The EventCounter of the client */
	public readonly eventCounter: EventCounter;
	/* The logger of the client
	public readonly logger: Logger;*/
	/** Collection of all registered aliases, mapped by alias to their command names */
	public readonly aliases: Collection<string, string>;
	/** Collection of all registered commands, mapped by their names */
	public readonly commands: Collection<string, Command>;
	/** Set of "NotCommand"s */
	public readonly notCommands: Set<NotCommand>;

	public constructor(options?: ClientOptions) {
		super(options);

		//loading config and data before everything else
		// is blocking
		this.config = require(join(__dirname, '..', '..', 'config'));
		this.data = new DataProvider();

		this.eventCounter = new EventCounter();
		//this.logger = new Logger();
		this.aliases = new Collection<string, string>();
		this.commands = new Collection<string, Command>();
		this.notCommands = new Set<NotCommand>();
		this._loadCommands();
		this._loadNotCommands();

		/** Register events and logging in */
		this.on('ready', () => info(`[ready] Logged in as ${this.user.tag} (${this.user.id})`))
			.once('ready', () => {
				(this as any).ws.connection.on('close', (event: any) => {
					warn('disconnect', '', event.code, ': ', event.reason);
					if (event.code === 1000) process.exit(200);
				});
			})
			.on('reconnecting', () => warn('Reconnecting'))
			.on('disconnect', (event: any) => {
				warn('disconnect', '', event.code, ': ', event.reason);
				if (event.code === 1000) process.exit(200);
			})
			.on('message', this.handleMessage)
			.on('messageUpdate', (oldMessage, newMessage) => {
				if (oldMessage.content !== newMessage.content) this.handleMessage(newMessage, oldMessage);
			})
			.on('warn', warn)
			.on('error', error)
			.on('resume', (replayed: number) => info('Resumed. Replayed events:', replayed))
			.on('raw', (packet: any) => this.eventCounter.trigger(packet.t))
			.login(this.config.token);
	}

	public async handleMessage(msg: Message, oldMsg: Message = null): Promise<void> {
		if (msg.author.id !== this.user.id) return this.handleNotCommand(msg, oldMsg);
		if (!msg.content.startsWith(this.config.prefix)) return;
		const [name, ...params]: string[] = msg.content.slice(this.config.prefix.length).split(/ +/);

		const command: Command = this.commands.get(name.toUpperCase())
			|| this.commands.get(this.aliases.get(name.toUpperCase()));

		if (!command) return;

		try {
			await command.run(msg, params, { alias: name });
		} catch (err) {
			error('The following error occured while running', name, '\n', err);
		}
	}

	/**
	 * Handles a not command, e.g. every message that is not a command.
	 * @param {Message} msg The incomming message
	 * @param {boolean} edit Whether the message was edited
	 * @returns {Promise<void>}
	 */
	public async handleNotCommand(msg: Message, oldMsg: Message): Promise<void> {
		for (const notCommand of this.notCommands) {
			await notCommand.run(msg, oldMsg);
		}
	}

	/**
	 * Reloads a command by filename.
	 * @param {string} filename The name of the file in the command directory
	 * @returns {string}
	 */
	public reloadCommand(filename: string): string {
		// TODO: Changing a command name breakes stuff, not intending to do so, but better be prepared.
		// aliases however should be working fine
		delete require.cache[require.resolve(join(__dirname, '..', 'commands', filename))];
		const commandClass: typeof Command = require(join(__dirname, '..', 'commands', filename)).default;
		const command: Command = new commandClass(this);

		if (this.commands.has(command.name)) this.commands.delete(command.name);
		for (const alias of command.aliases) if (this.aliases.get(alias) === command.name) this.aliases.delete(alias);

		this._validateCommandOptions(command);

		for (const alias of command.aliases) this.aliases.set(alias, command.name);
		this.commands.set(command.name, command);

		info(`${command.name} (${command.constructor.name}) has been reloaded.`);
		return `${command.name} (${command.constructor.name}) has been reloaded.`;
	}

	/**
	 * Loads all commands from the command dir.
	 * @returns {void}
	 * @private
	 */
	private _loadCommands(): void {
		const files: string[] = readdirSync(join(__dirname, '..', 'commands'));

		for (const file of files) {
			if (extname(file) !== '.js') continue;

			const commandClass: typeof Command = require(join(__dirname, '..', 'commands', file)).default;
			const command: Command = new commandClass(this);

			this._validateCommandOptions(command);

			for (const alias of command.aliases) this.aliases.set(alias, command.name);
			this.commands.set(command.name, command);
		}
		info(`${this.commands.size} commands have been loaded.`);
	}

	/**
	 * Validates a command's options, throws an error when invalid.
	 * @param {Command} command The command to validate
	 * @returns {void}
	 * @private
	 */
	private _validateCommandOptions(command: Command): void {
		if (command.name.toUpperCase() !== command.name) {
			throw new Error(oneLine`Command ${command.name} (${command.constructor.name})'s
				name is not in all uppercase!`);
		}

		if (this.commands.has(command.name)) {
			throw new Error(oneLine`
				Duplicate command name: ${command.name} from ${command.constructor.name}
				and ${this.commands.get(command.name).constructor.name}!`);
		}

		if (this.aliases.has(command.name)) {
			throw new Error(oneLine`
				Command name ${command.name} already registered as alias to
				${this.aliases.get(command.name)} (${this.aliases.get(command.name).constructor.name})!`);
		}

		for (const alias of command.aliases) {
			if (alias.toUpperCase() !== alias) {
				throw new Error(oneLine`
					Alias ${alias} from command ${command.name}
					(${command.constructor.name}) is not in all uppercase.`);
			}

			if (this.commands.has(alias)) {
				throw new Error(oneLine`
					Alias ${alias} from command ${command.name} (${command.constructor.name}) is
					 already registered as a command name from ${alias}
					 (${this.commands.get(alias).constructor.name})!`);
			}

			if (this.aliases.has(alias)) {
				throw new Error(oneLine`
					Duplicate aliases ${alias} from ${command.name} (${command.constructor.name})
					and ${this.aliases.get(alias)} (${this.commands.get(this.aliases.get(alias)).constructor.name})!`);
			}
		}
	}

	/**
	 * Loads all NotCommands from their directory.
	 * @returns {void}
	 * @private
	 */
	private _loadNotCommands() {
		const files: string[] = readdirSync(join(__dirname, '..', 'notCommands'));

		for (const file of files) {
			if (extname(file) !== '.js') continue;

			const notCommandClass: typeof NotCommand = require(join(__dirname, '..', 'notCommands', file)).default;
			const notCommand: NotCommand = new notCommandClass(this);

			this.notCommands.add(notCommand);
		}
		info(`${this.notCommands.size} notCommands have been loaded.`);
	}
}
