import { Collection, Message } from 'discord.js';
import { readdir } from 'fs';
import { parse, ParsedPath, sep } from 'path';
import { promisify } from 'util';

import { Loggable } from '../Types/LoggerDecorator';
import { Client } from './Client';
import { Command } from './Command';
import { CommandGroup } from './CommandGroup';
import { Logger } from './Logger';

// JavaScript and its circular references <.<
// tslint:disable-next-line:variable-name
let commandGroup: typeof CommandGroup;

/**
 * Promisifed readdir
 */
const readdirAsync: (path: string) => Promise<string[]> = promisify(readdir);

/**
 * Command registry, handling _commands and the like.
 */
@Loggable('[REGISTRY]')
export class CommandRegistry<T extends (Command<any> | CommandGroup<any>)>
{
	/**
	 * Reference to the logger singleton
	 * @protected
	 * @readonly
	 * @virtual
	 */
	protected readonly logger: Logger;
	/**
	 * Reference to the instantiating client
	 * @protected
	 * @readonly
	 */
	protected readonly client: Client;
	/**
	 * Collection of all loaded _aliases mapped by alias - command name
	 * @protected
	 * @readonly
	 */
	protected readonly _aliases: Collection<string, string> = new Collection<string, string>();
	/**
	 * Collection of all loaded commands mapped by their names
	 * @protected
	 * @readonly
	 */
	protected readonly _commands: Collection<string, T> = new Collection<string, T>();
	/**
	 * Base path where to read command from
	 * @protected
	 * @readonly
	 */
	protected readonly basePath: string;

	/**
	 * Instantiates a new Command registry.
	 * @param {Client} client
	 * @param {string} [basePath] Not require when deriving via a CommandGroup
	 */
	public constructor(client: Client, basePath?: string)
	{
		if (!commandGroup) commandGroup = require('./CommandGroup').CommandGroup;
		this.client = client;
		this.basePath = this instanceof commandGroup ? this._dirname : basePath;
	}

	/**
	 * Initiates the command registry, loading all commands in the base directory.
	 * @returns {Promise<void>}
	 */
	public async init(): Promise<void>
	{
		const files: string[] = await readdirAsync(this.basePath);

		for (const file of files)
		{
			const { ext, name }: ParsedPath = parse(file);

			if (this instanceof commandGroup
				// Can't access _protected_ class property outside of class :^)
				&& ((this as any).basePath + sep + file) === this._filename
			)
			{
				continue;
			}

			if (ext === '.js')
			{
				const command: Command<any> = this.loadCommand(name);
				this.logger.info('Loaded command:', command.name);
			}
			else if (ext === '')
			{
				const commandGroupInstance: CommandGroup<any> = await this.loadCommandGroup(name);

				this.logger.info('Loaded command group:', commandGroupInstance.name);
			}
			else
			{
				this.logger.warn(`Unexpected file extension ${ext} (${file})`);
			}
		}
	}

	/**
	 * Resolves a command name or alias to the command of this group.
	 * @param {Message} msg
	 * @param {string[]} args First element being the command name, following are the args
	 * @returns {?[Command<U>, string, string[]]}
	 * @virtual
	 */
	public resolveCommand<U extends CommandGroup<any> = never>(msg: Message, [name, ...args]: string[])
		: [Command<U>, string, string[]]
	{
		if (!name) return null;

		const command: Command<U> | CommandGroup<any> = this._commands.get(name.toUpperCase()) as any
			|| this._commands.get(this._aliases.get(name.toUpperCase()))
			|| null;

		if (!command) return null;
		if (command instanceof commandGroup) return command.resolveCommand(msg, args);

		return [command, name, args];
	}

	/**
	 * Gets a command or command group by name or alias, returns null when nothing was found.
	 * @param {string} name
	 * @returns {?Command|CommandGroup}
	 */
	public getCommand<U extends T>(name: string): U
	{
		if (!name) return null;

		const command: T = this._commands.get(name.toUpperCase())
			|| this._commands.get(this._aliases.get(name.toUpperCase()))
			|| null;

		// T is not necessarily assignable to U, but we "know what we are doing here", don't we?
		return command as any;
	}

	/**
	 * Reloads a command by its name
	 * or when no name is specified the whole group including base module
	 * @param {string[]} chain
	 * @param {CommandRegistry<any>} [previous]
	 * @returns {void}
	 */
	public async reload(chain: string[], previous?: CommandRegistry<any>): Promise<void>
	{
		if (!chain.length)
		{
			if (!(this instanceof commandGroup) || !previous) throw new Error('Missing name to reload!');

			// Can't access _protected_ class properties outside of class :^)
			// ts at its finest
			for (const _command of (this as any)._commands.values())
			{
				delete require.cache[require.resolve((this as any).basePath + sep + _command.filename)];
			}

			previous._commands.delete(this.name);
			for (const alias of this.aliases)
			{
				previous._aliases.delete(alias);
			}

			await previous.loadCommandGroup(this.filename);

			(this as any).logger.info(`Reloaded command group ${this.name}`);

			return;
		}

		const command: Command | CommandGroup<any> = this._commands.get(chain[0].toUpperCase()) as any
			|| this._commands.get(this._aliases.get(chain[0].toUpperCase()));

		if (command instanceof commandGroup)
		{
			return command.reload(chain.slice(1), this);
		}

		if (command)
		{
			this._commands.delete(command.name);
			for (const alias of command.aliases)
			{
				this._aliases.delete(alias);
			}

			delete require.cache[require.resolve(this.basePath + sep + command.filename)];
		}

		this.loadCommand(command ? command.filename : (chain[0][0].toUpperCase() + chain[0].slice(1).toLowerCase()));

		this.logger.info('[RELOAD]', 'Reloaded sub command:', command.name);
	}

	/**
	 * Loads a command by name from the base directory
	 * @param {string} file
	 * @returns {Command}
	 */
	public loadCommand(file: string): Command<any>
	{
		const commandClass: typeof Command = require(`${this.basePath}/${file}`)[`${file}Command`];

		if (!commandClass) throw new Error(`${file}'s export is falsy!`);

		if (!(commandClass.prototype instanceof Command))
		{
			throw new Error(`${file}'s export's prototype is not instanceof Command!`);
		}

		const command: Command<any> = new commandClass(this.client,
			this instanceof commandGroup ? this as any : undefined,
		) as Command;

		this._validateCommandOptions(command);

		for (const alias of command.aliases) this._aliases.set(alias, command.name);
		this._commands.set(command.name, command as T);

		return command;
	}

	/**
	 * Loads a command group by name from the commands directory
	 * @param {string} file
	 * @returns {Promise<CommandGroup<U>>}
	 */
	public async loadCommandGroup<U extends CommandGroup<any> = any>(file: string): Promise<CommandGroup<U>>
	{
		const commandGroupClass: typeof CommandGroup = require(`${this.basePath}/${file}/${file}`)[`${file}CommandGroup`];

		if (!commandGroupClass) throw new Error(`${file}/${file}'s export is falsy!`);

		if (!(commandGroupClass.prototype instanceof commandGroup))
		{
			throw new Error(`${file}/${file}'s export's prototype is not instanceof CommandGroup`);
		}

		const commandGroupInstance: CommandGroup<U> = new commandGroupClass<U>(this.client);

		await commandGroupInstance.init();

		this._validateCommandOptions(commandGroupInstance);

		for (const alias of commandGroupInstance.aliases) this._aliases.set(alias, commandGroup.name);
		this._commands.set(commandGroup.name, commandGroupInstance as T);

		return commandGroupInstance;
	}

	/**
	 * Validates a command's options, throws an error when invalid.
	 * @param {Command|CommandGroup} command The command or command group to validate
	 * @returns {void}
	 * @private
	 */
	private _validateCommandOptions(command: Command<any> | CommandGroup<any>): void
	{
		if (command.name.toUpperCase() !== command.name)
		{
			throw new Error(`Command ${command.name} (${command.constructor.name})'s name is not in all uppercase!`);
		}

		if (this._commands.has(command.name))
		{
			throw new Error(
				[
					`Duplicate command name: ${command.name} from ${command.constructor.name}`,
					`and ${this._commands.get(command.name).constructor.name}!`,
				].join(''),
			);
		}

		if (this._aliases.has(command.name))
		{
			throw new Error(
				[
					`Command name ${command.name} already registered as alias to`,
					`${this._aliases.get(command.name)} (${this._aliases.get(command.name).constructor.name})!`,
				].join(''),
			);
		}

		for (const alias of command.aliases)
		{
			if (alias.toUpperCase() !== alias)
			{
				throw new Error(
					`Alias ${alias} from command ${command.name} (${command.constructor.name}) is not in all uppercase.`,
				);
			}

			if (this._commands.has(alias))
			{
				throw new Error(
					[
						`Alias ${alias} from command ${command.name} (${command.constructor.name})`,
						`already registered as a command name from ${alias}`,
						`(${this._commands.get(alias).constructor.name})!`,
					].join(''),
				);
			}

			if (this._aliases.has(alias))
			{
				throw new Error(
					[
						`Duplicate _aliases ${alias} from ${command.name} (${command.constructor.name})`,
						`and ${this._aliases.get(alias)} (${this._commands.get(this._aliases.get(alias)).constructor.name})!`,
					].join(''),
				);
			}
		}
	}
}
