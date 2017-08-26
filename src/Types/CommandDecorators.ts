/**
 * Specifies aliases for a command
 * @param {...string} aliases
 * @returns {ClassDecorators}
 */
export function Aliases(...aliases: string[]): ClassDecorator
{
	// tslint:disable-next-line:ban-types
	return function decorateAliases<T extends Function>(constructor: T): void
	{
		Reflect.defineProperty(constructor.prototype, 'aliases', { value: aliases });
	};
}
