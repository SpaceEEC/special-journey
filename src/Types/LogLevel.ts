export enum LogLevel
{
	ERROR,
	WARN,
	INFO,
	VERBOSE,
	DEBUG,
	SILLY,
	NONE,
}

export const colors: Color = {
	[LogLevel.ERROR]: 31,
	[LogLevel.WARN]: 33,
	[LogLevel.INFO]: 32,
	[LogLevel.VERBOSE]: 36,
	[LogLevel.DEBUG]: 34,
	[LogLevel.SILLY]: 35,
	[LogLevel.NONE]: 0,
};

export type Color = { [index: number]: number; };
