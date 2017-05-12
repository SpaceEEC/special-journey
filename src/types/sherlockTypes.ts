
// #region translate

/** Represents a language */
export type Language = {
	/** The english name of this language */
	name: string;
	/** The local name of this language */
	local: string;
	/** The language code of this language (Probably ISO 639) */
	code: string;
};

/** Represents a translate endpoint response. */
export type TranslateResponse = {
	/** Whether the request was successful */
	ok: boolean;
	/** Error description when the request failed */
	error: string;
	/** Detected or supplied language the query was translated from */
	to: Language;
	/** Language the query was translated to */
	from: Language;
	/** The original message which was translated */
	query: string;
	/** The translated text  */
	result: string;
};

// #endregion

// #region convert

/** An interface representing a unit as response from sherlock api. */
export type Unit = {
	/** The value */
	value: number;
	/** The unit */
	unit: string;
	/** The displaytext of both of other properties */
	display: string;
};

/** Represents a sherlock api convert endpoint response. */
export type ConvertResponse = {
	/** Whether the operation was successful */
	ok: boolean;
	/** Error description when the request failed */
	error: string;
	/** The "unti" converted from the interpreted query */
	output: Unit;
	/** The "unit" interpreted from the query */
	input: Unit;
	/** The sent text */
	query: string;
};

  // #endregion
