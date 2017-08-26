export function Directory(dirname: string): ClassDecorator
{
	// tslint:disable-next-line:ban-types
	return function decorateName<T extends Function>(constructor: T): void
	{
		Reflect.defineProperty(constructor.prototype, '_dirname', { value: dirname });
	};
}
