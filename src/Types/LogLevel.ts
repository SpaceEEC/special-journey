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
	0: 31,
	1: 33,
	2: 32,
	3: 36,
	4: 34,
	5: 35,
	6: 0,
};

export type Color = { [index: number]: number; };
