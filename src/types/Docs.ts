/** Represents dicsord.js' docs */
export type Docs = {
	/** Informations about the docgen used to generate the JSON */
	meta: {
		/** Version of the docgen */
		generator: string;
		/** format */
		format: number;
		/** timestamp */
		date: number;
	};
	/** Custom pages */
	custom: Custom;
	/** All classes of the lib */
	classes: _Class[];
	/** All interfaces of the lib */
	interfaces: _Interface[];
	/** All typedefs of the lib */
	typedefs: Typedef[];
	/** All external things the lib's docs are referring to */
	externals: _External[];
};

/** Represents custom pages */
export type Custom = {
	/** Name of a custom doc page category */
	[name: string]: {
		/** Name of this custom doc page category */
		name: string;
		/** Object literal with pages of this category */
		files: {
			/** Name of a page */
			[name: string]: {
				/** Name of this page */
				name: string;
				/** File ending, most likely md */
				type: string;
				/** Content of the page */
				content: string;
				/** Relative file path to the page */
				path: string;
			}
		}
	}
};

/** Represents a class of discord.js */
export type _Class = {
	/** Class name */
	name: string;
	/** Description */
	description: string;
	/** Links to another class */
	see: string,
	/** Whether this class is deprecated */
	deprecated: boolean;
	/** Access modifier */
	access: string;
	/** Whether this class is abstract */
	abstract: boolean;
	/** Class name of extending class(es) */
	extends: string[];
	/** Informations about the constructor */
	construct: Constructor;
	/** Properties of this class */
	props: Prop[];
	/** Methods of this class */
	methods: Method[];
	/** Events this class emits */
	events: Event[];
	/** Metadata about this class */
	meta: Meta;
};

/** Represents an interface of discord.js */
export type _Interface = {
	/** Name of this interface */
	name: string;
	/** Description of this interface */
	description: string;
	/** Properties of this interface */
	props: Prop[];
	/** Methods of this interface */
	methods: Method[];
	/** Metadata about this interface */
	meta: Meta;
};

/** Represents a typedef of discord.js */
export type Typedef = {
	/** Name of this typedef */
	name: string
	/** Description of this typedef */
	description: string;
	/** Type(s) this typedef is representing */
	type: Types;
	/** Properties of this typedef */
	props: Prop[];
	/** Metadata about this typedef */
	meta: Meta;
};

/** Represents an external type */
export type _External = {
	/** Name of this external type */
	name: string;
	/** The link formatted as {@link <url>} */
	see: string[];
	/** Metadata about this external type */
	meta: Meta;
};

/** Represents generic Metadata */
export type Meta = {
	/** Line number of the file */
	line: number;
	/** The relevant file name */
	file: string;
	/** The relevant relative file path */
	path: string;
};

/** Represents a parameter */
export type Parameter = {
	/** Name of this parameter */
	name: string;
	/** Description of this parameter */
	description: string;
	/** Whether this parameter is optional */
	optional: boolean;
	/** The default value of this parameter */
	default: string;
	/** Type of this parameter (why is it in an array in an array in an array?) */
	type: Types;
};

/** Represents a prop */
export type Prop = {
	/** Name of this prop */
	name: string;
	/** Description of this prop */
	description: string;
	/** Whether this prop is deprecated */
	deprecated: boolean;
	/** The scope of this prop (static) */
	scope: string;
	/** Whether this prop is nullabe */
	nullable: boolean;
	/** Whether this prop is readonly */
	readonly: boolean;
	/** Access modifier */
	access: string;
	/** Type of this prop */
	type: Types;
	/** Metadata about this prop */
	meta: Meta
};

/** Represents a method */
export type Method = {
	/** Name of this method */
	name: string;
	/** Description of this method */
	description: string;
	/** Whether this method is deprecated */
	deprecated: boolean;
	/** The scope of this method (static) */
	scope: string;
	/** From where this is inherited from */
	inherits: string;
	/** Whether this method is inherited */
	inherited: boolean;
	/** Examples for this method */
	examples: string[];
	/** Access modifier */
	access: string;
	/** Parameter this method accepts */
	params: Parameter[]
	/** Whatever this method returns */
	returns: Types;
	/** Metadata about this method */
	meta: Meta;
};

/** Represents an event */
export type Event = {
	/** Name of this event */
	name: string;
	/** Description of this event */
	description: string;
	/** Whether this event is deprecated */
	deprecated: boolean;
	/** Parameter this event emits */
	params: Parameter[];
	/** Metadata about this event */
	meta: Meta;
	/** avoid semantics */
	access: string;
	/** avoid semantics */
	scope: string;
};

/** Represens a Constructor */
export type Constructor = {
	/** name (of the class?) */
	name: string,
	/** parameters this constructor must or may be passed */
	params: Parameter[];
};

/** Represents a type object */
export type Types = {
	/** Whatever this types represents */
	types: string[][][];
	/** Description of this type, if any */
	description: string;
	/** Whether this type is nullable */
	nullable: boolean;
} | string[][][];
