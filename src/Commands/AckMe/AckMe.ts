import { AckMe } from '../../DataProviders/Models/AckMe';
import { CommandGroup } from '../../Structures/CommandGroup';
import { Directory } from '../../Types/CommandGroupDecorators';
import { Loggable } from '../../Types/LoggerDecorator';

@Loggable('[GROUP][AckMe]')
@Directory(__dirname)
export class AckMeCommandGroup extends CommandGroup<AckMeCommandGroup>
{
	/**
	 * Set of cached guilds which are part of the acking list
	 * @private
	 * @readonly
	 */
	private _cache: Set<string>;

	/**
	 * Adds a guild to the acking list.
	 * @param {string} guildId
	 * @returns {boolean} Whether the guild was added to the acking list
	 */
	public async add(guildId: string): Promise<boolean>
	{
		if (!this._cache) await this._syncGuilds();

		if (this._cache.has(guildId)) return false;

		await AckMe.create({ guildId });
		this._cache.add(guildId);

		return true;
	}

	/**
	 * Removes a guild from the acking list.
	 * @param {string} guildId
	 * @returns {boolean} Whether the guild was actually removed from the acking list and not on it in the first place
	 */
	public async remove(guildId: string): Promise<boolean>
	{
		if (!this._cache) await this._syncGuilds();

		if (!this._cache.has(guildId)) return false;

		await AckMe.destroy({ where: { guildId } });
		this._cache.delete(guildId);

		return true;
	}

	/**
	 * Whether a guild is on the acking list.
	 * @param {string} guildId
	 * @returns {boolean}
	 */
	public async has(guildId: string): Promise<boolean>
	{
		if (!this._cache) await this._syncGuilds();

		return this._cache.has(guildId);
	}

	/**
	 * Gets the cache.
	 * @returns {Promise<Set<string>>} Reference!
	 */
	public async getCache(): Promise<Set<string>>
	{
		return this._cache || this._syncGuilds();
	}

	/**
	 * Caches all guild which are part of the acking list
	 * and assign those to the _cache property of this class and returns it.
	 * @returns {Promise<Set<String>>}
	 * @private
	 */
	private async _syncGuilds(): Promise<Set<string>>
	{
		const guilds: AckMe[] = await AckMe.findAll<AckMe>();

		this._cache = new Set<string>();
		for (const guild of guilds) this._cache.add(guild.guildId);

		return this._cache;
	}
}
