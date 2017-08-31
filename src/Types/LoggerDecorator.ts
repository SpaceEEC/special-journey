// tslint:disable:ban-types

import { Logger } from '../structures/Logger';

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
		// tslint:disable-next-line:only-arrow-functions
		return function <T extends Function>(constructor: T): void
		{
			annotate(constructor, args[0], args[1]);
		};
	}

	annotate(args[0]);
}

function annotate<T extends Function>(constructor: T, tag: string = '', defineStatic: boolean = false): void
{
	if (!tag)
	{
		Reflect.defineProperty(
			defineStatic ? constructor : constructor.prototype,
			'logger',
			{ value: Logger.instance },
		);
	}
	else
	{
		Reflect.defineProperty(
			defineStatic ? constructor : constructor.prototype,
			'logger',
			{
				value: new Proxy(Logger.instance,
					{
						get: (target: any, prop: PropertyKey) =>
						{
							if (typeof target[prop] === 'function')
							{
								if (prop === 'setLogLevel')
								{
									return (...params: any[]) => target[prop](...params);
								}

								return (...toLog: any[]) => target[prop](tag, ...toLog);
							}

							return target[prop];
						},
					},
				),
			},
		);
	}
}
