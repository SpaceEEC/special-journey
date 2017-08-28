import { join } from 'path';
import { Sequelize } from 'sequelize-typescript';
import { inspect } from 'util';

import { Loggable, Logger } from '../structures/logger';

const { DB_NAME, DB_LOGIN, DB_PASSWORD }: { [key: string]: string } = process.env;

@Loggable('[Database]', true)
export abstract class Database
{
	public static get db(): Sequelize
	{
		return Database.database;
	}

	public static start(): PromiseLike<void>
	{
		return Database.database.authenticate()
			.then(() => Database.logger.info('Connection established successfully.'))
			.catch((error: Error) => Database.logger.error('Failed to establish a connection to the database:', error))
			.then(() => Database.database.sync())
			.catch((error: Error) => Database.logger.error('Failed to sync database', error));
	}

	private static readonly logger: Logger;

	private static readonly database: Sequelize = new Sequelize({
		dialect: 'postgres',
		logging: (output: any) => Database.logger.silly(inspect(output)),
		modelPaths: [join(__dirname, 'Models')],
		name: DB_NAME,
		password: DB_PASSWORD,
		username: DB_LOGIN,
	});
}
