// tslint:disable:ban-types
// tslint:disable:only-arrow-functions

import { Logger } from '../structures/Logger';
import { LogLevel } from './LogLevel';

// copy pasted from here
// https://github.com/zajrik/yamdbf/blob/master/src/util/logger/LoggerDecorator.ts
export function logger<T extends Object>(target: T, key: string): void
{
	Reflect.defineProperty(
		target,
		key,
		{ value: Logger.instance },
	);
}

// and this from here
// https://github.com/RobinBuschmann/sequelize-typescript/blob/master/lib/annotations/Column.ts
export function Loggable(prefix: string, defineStatic?: boolean): ClassDecorator;
export function Loggable<T extends Function>(constructor: T): void;
export function Loggable(...args: any[]): ClassDecorator | void
{
	if (typeof args[0] === 'string')
	{
		return function <T extends Function>(constructor: T): void
		{
			Reflect.defineProperty(
				args[1] ? constructor : constructor.prototype,
				'logger',
				{
					value: new Proxy(Logger.instance,
						{
							get: (target: any, prop: PropertyKey) =>
							{
								if (typeof target[prop] === 'function')
								{
									if (LogLevel.hasOwnProperty(String(prop).toUpperCase()))
									{
										return (...toLog: any[]) => target[prop](args[0], ...toLog);
									}

									return (...params: any[]) => target[prop](...params);
								}

								return target[prop];
							},
						},
					),
				},
			);
		};
	}

	Reflect.defineProperty(args[0].prototype, 'logger', { value: Logger.instance });
}
