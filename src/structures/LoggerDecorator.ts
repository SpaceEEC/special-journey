// wonderful nearly copy paste from here
// https://github.com/zajrik/yamdbf/blob/master/src/util/logger/LoggerDecorator.ts

import { Logger } from './Logger';

export function logger<T extends { new(...args: any[]): {} }>(constructor: T): void
{
	Object.defineProperty(constructor.prototype, 'logger', { value: Logger.instance });
}
