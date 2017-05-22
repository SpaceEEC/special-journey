import { stripIndents } from 'common-tags';
import { Message, RichEmbed } from 'discord.js';

import { SelfbotClient } from '../structures/client';
import { Command } from '../structures/command';
import { _Class, _Interface, Docs, Event, Method, Parameter, Prop, Typedef, Types } from '../types/Docs';

enum Format {
	constructor,
	title,
	method,
	event,
}

type VersionedObject<T> = {
	[version: string]: T;
};

export default class DocsCommand extends Command {
	/** Classes of different versions */
	private readonly _classes: VersionedObject<_Class[]>;
	/** Interfaces of different versions */
	private readonly _interfaces: VersionedObject<_Interface[]>;
	/** Typedefs of different versions */
	private readonly _typedefs: VersionedObject<Typedef[]>;
	/** Available versions of docs */
	private readonly _versions: string[];
	/** Current selected version of docs to use */
	private _version: string;

	public constructor(client: SelfbotClient) {
		super(client, {
			name: 'DOCS',
			aliases: ['DOC', 'DOSC'],
		});

		this._versions = ['11.1.0', '11.1-dev', 'master'];
		this._classes = {};
		this._interfaces = {};
		this._typedefs = {};

		for (const version of this._versions) {
			const docs: Docs = require(`../../docs/${version}.json`) as Docs;
			this._classes[version] = docs.classes;
			this._interfaces[version] = docs.interfaces;
			this._typedefs[version] = docs.typedefs;
		}

		this._version = '11.1-dev';
	}

	public async run(msg: Message, args: string[]): Promise<Message | Message[]> {
		if (!args[0]) return;
		const [first, second]: string[] = args[0].toUpperCase().split(/\#|\.|\,/g);

		return this._findClass(msg, first, second)
			|| this._findInterface(msg, first, second)
			|| this._findTypedef(msg, first, second)
			|| this._changeVersion(msg, first, (args[1] || '').toLowerCase())
			|| msg.edit(`\u200b${msg.content}\nNothing found`);
	}

	/**
	 * Displays or changes the current used version / all versions.
	 * @param {Message} msg
	 * @param {string} first
	 * @param {string} second
	 * @returns {?Promise<Message|Message[]>}
	 * @private
	 */
	private _changeVersion(msg: Message, first: string, second: string): Promise<Message | Message[]> {
		if (['MASTER', 'STABLE', 'INDEV'].includes(first)) second = first.toLowerCase();
		else if (!['VERSION', 'VERSIONS'].includes(first)) return null;

		if (!second) return msg.edit(`Version of docs to display currently is ${this._version}.`);

		const versions: { [index: string]: string } = {
			stable: '11.1.0',
			'11.1': '11.1.0',
			indev: '11.1-dev',
			'12': 'master',
			'12.0.0': 'master',
			master: 'master',
		};

		if (versions[second] || this._versions.includes(second)) {
			this._version = versions[second] || second;

			return msg.edit(`The version of docs to display has been changed to ${this._version}.`);
		}

		if (second === 'all') {
			return msg.edit(`Available versions are v\`${this._versions.join('`, `')}\`.`);
		}

		return msg.edit('Could not interpret input.');
	}

	/**
	 * Tries to find a class based on user input, if found sends message containing additional information.
	 * @param {Message} msg Original message
	 * @param {string} name Name of the class
	 * @param {string} [prop] Name of the property to search for, if any
	 * @returns {?Promise<Message|Message[]>}
	 * @private
	 */
	private _findClass(msg: Message, name: string, prop: string): Promise<Message | Message[]> {
		const _class: _Class = this._classes[this._version].find((_tmpClass: _Class) => _tmpClass.name.toUpperCase() === name);

		if (!_class) return null;

		if (prop) {
			const found: Promise<Message | Message[]> = this._findProp(msg, prop, _class, true)
				|| this._findMethod(msg, prop, _class)
				|| this._findEvent(msg, prop, _class);
			if (found) return found;
		}

		let classSuffix: string = (_class.extends ? ` extends **[${_class.extends[0]}](${this._getLink(_class.extends[0], '')})**` : '')
			+ (_class.implements ? ` implements **${_class.implements[0]}**` : '')
			+ (_class.abstract ? ' (Abstract) ' : '');

		const embed: RichEmbed = this._embedSample
			.setDescription(stripIndents`
			**[${_class.name}](${this._getLink(_class.name, '')})**${classSuffix}

			${this._formatDescription(_class.description)}

			** Constructor:** ${this._formatParams(_class.construct && _class.construct.params, Format.constructor)}

			** Properties:** ${this._formatProps(_class.props)}

			** Methods:** ${this._formatProps(_class.methods)}

			** Events:** ${this._formatProps(_class.events)}
			`);

		return msg.edit({ embed });
	}

	/**
	 * Tries to find an interface based on user input, if found sends message containing additional information.
	 * @param {Message} msg Original message
	 * @param {string} name Name of the interface
	 * @param {string} [prop] Name of the property to search for, if any
	 * @returns {?Promise<Message|Message[]>}
	 * @private
	 */
	private _findInterface(msg: Message, name: string, prop?: string): Promise<Message | Message[]> {
		const _interface = this._interfaces[this._version].find((_tempInterface: _Interface) => _tempInterface.name.toUpperCase() === name);

		if (!_interface) return null;

		if (prop) {
			const found: Promise<Message | Message[]> = this._findProp(msg, prop, _interface, false)
				|| this._findMethod(msg, prop, _interface, false);
			if (found) return found;
		}

		const embed: RichEmbed = this._embedSample
			.setDescription(stripIndents`
			**${_interface.name}**

			${this._formatDescription(_interface.description)}

			** Properties:** ${this._formatProps(_interface.props)}

			** Methods:** ${this._formatProps(_interface.methods)}
			`);

		return msg.edit({ embed });
	}

	/**
	 * Tries to find a typedef based on user input, if found sends a message containing additional information.
	 * @param {Message} msg Original message
	 * @param {string} name Name of the typedef to search for
	 * @param {string} [prop] Name of the property to search for, if any
	 * @returns {?Promise<Message|Message[]>}
	 * @private
	 */
	private _findTypedef(msg: Message, name: string, prop: string): Promise<Message | Message[]> {
		const typedef = this._typedefs[this._version].find((_typedef: Typedef) => _typedef.name.toUpperCase() === name);

		if (!typedef) return null;

		if (prop && typedef.props && typedef.props.length) {
			const found: Promise<Message | Message[]> = this._findProp(msg, prop, typedef, undefined);
			if (found) return found;
		}

		const embed: RichEmbed = this._embedSample
			.setDescription(stripIndents`
			**[${typedef.name}](${this._getLink(typedef.name)})**

			${this._formatDescription(typedef.description)}

			** Properties:** ${this._formatProps(typedef.props)}

			** Type:** ${this._formatType(typedef.type)}
			`);

		return msg.edit({ embed });
	}

	/**
	 * Tries to find a property based on user input, if found sends a message containing additional information.
	 * @param {Message} msg Original message
	 * @param {string} property Name of the property to search for
	 * @param {_Class | _Interface | Typedef} main Class, Interface or Typedef where the property should be searched
	 * @param {boolean} linkProp Whether the link should point to the prop rather than the class
	 * @returns {?Promise<Message|Message[]>}
	 * @private
	 */
	private _findProp(msg: Message, prop: string, main: _Class | _Interface | Typedef, linkProp: boolean): Promise<Message | Message[]> {
		const property: Prop = main.props && main.props.find((_prop: Prop) => _prop.name.toUpperCase() === prop);

		if (!property) return null;

		const title: string = linkProp
			? `[${main.name}.${property.name}](${this._getLink(main.name, (property.scope ? `s-` : '') + property.name)})`
			: `[${main.name}.${property.name}](${this._getLink(main.name)})`;

		const embed: RichEmbed = this._embedSample
			.setDescription(stripIndents`
			${property.scope ? ` (Static) ` : ''}**${title}**
			${property.deprecated ? 'This property is deprecated!\n' : ''}
			${this._formatDescription(property.description)}

			** Type:** ${this._formatType(property.type)}
			`);

		if (property.deprecated) embed.setColor(0xff0000);

		return msg.edit({ embed });
	}

	/**
	 * Tries to find a method based on user input, if found sends a message containing additional information.
	 * @param {Message} msg Original message
	 * @param {string} prop Name of the method to search for
	 * @param {_Class | _Interface} main Class or Interface where the method should be searched
	 * @param {boolean} link Whether a link should be generated
	 * @returns {?Promise<Message|Message[]>}
	 * @private
	 */
	private _findMethod(msg: Message, prop: string, main: _Class | _Interface, link: boolean = true): Promise<Message | Message[]> {
		const method: Method = main.methods && main.methods.find((_method: Method) => _method.name.toUpperCase() === prop);

		if (!method) return null;

		const title: string = link
			? `[${main.name}.${method.name}](${this._getLink(main.name, (method.scope ? `s-` : '') + method.name)})`
			: `${main.name}.${method.name}`;

		const embed: RichEmbed = this._embedSample
			.setDescription(stripIndents`
			${method.scope ? ` (Static) ` : ''}**${title}**(${this._formatParams(method.params, Format.title)})
			${method.deprecated ? 'This method is deprecated!\n' : ''}
			${this._formatParams(method.params, Format.method)}
			${this._formatDescription(method.description)}${method.examples && method.examples[0] ? `\n\n**Example:**\`\`\`js\n${method.examples[0]}\`\`\`` : ''}

			**Returns:** ${this._formatType(method.returns)}
			`);

		if (method.deprecated) embed.setColor(0xff0000);

		return msg.edit({ embed });
	}

	/**
	 * Tries to find an event based on user input, if found sends a message containing additional information.
	 * @param {Message} msg Original message
	 * @param {string} second Name of the event to search for
	 * @param {_Class} main Class where the event should be searched
	 * @returns {?Promise<message|Message[]>}
	 * @private
	 */
	private _findEvent(msg: Message, second: string, main: _Class): Promise<Message | Message[]> {
		const event: Event = main.events && main.events.find((_event: Event) => _event.name.toUpperCase() === second);

		if (!event) return null;

		const embed: RichEmbed = this._embedSample
			.setDescription(stripIndents`
			**[${main.name}.${event.name}](${this._getLink(main.name, event.name)})**
			${event.deprecated ? '**This event is deprecated!**\n' : ''}
			${this._formatDescription(event.description)}

			**Params:** ${this._formatParams(event.params, Format.event)}
			`);

		if (event.deprecated) embed.setColor(0xff0000);

		return msg.edit({ embed });
	}

	/**
	 * Formats properties, ignoring privates, prefixing statics and suffixing deprecated properties.
	 * @param {Prop[]} props Array of props
	 * @returns {string} Formattet string
	 * @private
	 */
	private _formatProps(props: Prop[] | Method[] | Event[]): string {
		if (!props || !props.length) return 'None';

		let formatted: string = '';
		for (const prop of props) {
			if (prop.access === 'private') continue;
			formatted += `\`${prop.scope ? `(S) ` : ''}${prop.deprecated ? '(D)' : ''}${prop.name}\`, `;
		}

		return formatted.slice(0, -2) || 'None';
	}

	/**
	 * Format types and joins different options with a | seperator, additionally adds informations when available.
	 * @param {Types} types Type to format
	 * @returns {string} Formatted string
	 * @private
	 */
	private _formatType(types: Types): string {
		if (!types) return 'void';

		let formatted: string = '`';
		let suffix: string = '`';
		if (!(types instanceof Array)) {
			if (types.nullable) formatted += '?';
			if (types.description) suffix += `\n${types.description}`;
			types = types.types;
		}

		for (const type of types) {
			for (const typePart of type) for (const typeSnippet of typePart) {
				formatted += typeSnippet;
			}
			formatted += ' | ';
		}

		return formatted.slice(0, -3) + suffix;
	}

	/**
	 * Nicely formats parameter to a string.
	 * @param {Parameter[]} params Parameter to format
	 * @param {Format} format Format to format to
	 * @returns {string} Formatted string
	 * @private
	 */
	private _formatParams(params: Parameter[], format: Format): string {
		if (!params || !params.length) {
			if ([Format.title, Format.method].includes(format)) return '';
			return 'None';
		}

		let formatted: string = '';

		// events and methods
		if ([Format.event, Format.method].includes(format)) {
			if (format === Format.event && params.length - 1) formatted = '\n';
			for (const param of params) {
				formatted += `\`${param.name}${format === Format.method && param.optional ? '?' : ''}: ${this._formatType(param.type).slice(1)}`;

				if (format === Format.method && param.default) formatted += `\nDefault value: ${param.default}`;
				formatted += `\n${param.description}\n\n`;
			}

			return formatted.slice(0, -2);
		}

		// constructor and title
		for (const param of params) {
			formatted += param.optional
				? format === Format.constructor
					? `${param.name}?`
					: `[${param.name}]`
				: param.name;

			if (format === Format.constructor) {
				const length: number = (param.type instanceof Array ? param.type.length : param.type.types.length) - 1;
				const formattedParams: string = this._formatType(param.type).slice(1, -1);
				formatted += `: ${length ? `(${formattedParams})` : formattedParams}`;
			}

			formatted += format === Format.constructor ? ',\n' : ', ';
		}

		return params.length - 1 && format === Format.constructor
			? `\`\`\`\n${formatted.slice(0, -2)}\`\`\``
			: `\`${formatted.slice(0, -2)}\``;
	}

	/**
	 * Formats the description, replacing tags with their unicodes and replaceing {@link <something>} with their URLs.
	 * @param {string} description Description to format
	 * @returns {string} Formatted description
	 * @private
	 */
	private _formatDescription(description: string): string {
		const object: { [index: string]: string } = { '<warn>': '⚠ ', '<info>': 'ℹ ', '<\/warn>': ' ⚠', '<\/info>': ' ℹ', '\n': '\u200b' };

		return description.replace(/(<\/?warn>|<\/?info>|\n)|{@link (.+)}/g, (substring: string, ...match: string[]) =>
			object[match[0]] || this._formatLink(...match)
		);
	}

	/**
	 * Formats a matched {@link <something>} to it's corresponding url.
	 * @param {...string} input all matched strings
	 * @returns {string} Formatted URL
	 * @private
	 */
	private _formatLink(...input: string[]): string {
		let [_class, _prop = '']: string[] = (input[0] || input[1]).split('#');
		if (this._typedefs[this._version].some((typedef: Typedef) => typedef.name === _class)) _prop = undefined;

		return `[${(input[0] || input[1])}](${this._getLink(_class, _prop)})`;
	}

	/**
	 * Generates a link to a specific class or prop.
	 * @param {string} _class Name of the class
	 * @param {string} [prop] Name of the prop
	 * @returns {string} Link to the docs
	 * @private
	 */
	private _getLink(_class: string, prop?: string): string {
		return `https://discord.js.org/#/docs/main/${this._version}/${typeof prop === 'undefined' ? 'typedef' : 'class'}/${_class + (prop ? `?scrollTo=${prop}` : '')}`;
	}

	/**
	 * Provides a sample embed to avoid too much code duplication
	 * or at least trying to do so
	 * @type {Richembed}
	 * @private
	 * @readonly
	 */
	private get _embedSample(): RichEmbed {
		return new RichEmbed()
			.setFooter(`discord.js' ${this._version} docs`, 'https://discord.js.org/static/favicon.ico')
			.setColor(2201331);
	}

}
