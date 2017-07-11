export type JishoAPIResponse =
	{
		meta:
		{
			status: number;
		}
		data: JishoData[];
	};

export type JishoData =
	{
		is_common: boolean;
		/** Untested */
		tags: string[];
		japanese: JishoWord[];
		senses: JishoSense[];
		attribution:
		{
			[index: string]: boolean | string;
		}
	};

export type JishoWord =
	{
		word: string;
		reading: string;
	};

export type JishoSense =
	{
		english_definitions: string[];
		parts_of_speech: string[];
		links: URLReference[];
		tags: string[];
		/** Untested */
		restrictions: string[];
		/** Untested */
		see_also: string[];
		/** Untested */
		antonyms: string[];
		/** Untested */
		source: any;
		/** Untested */
		info: any;
	};

export type URLReference =
	{
		text: string;
		url: string;
	};
