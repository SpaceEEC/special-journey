const { get } = require('snekfetch');

exports.run = async (client, msg, params = []) => {
	let url;
	let auth;
	try {
		if (msg.cmd === 'token') {
			url = 'https://discordapp.com/api/v6/users/@me';
			auth = params.join(' ');
		} else {
			const id = Buffer.from(params[0].split('.')[0], 'base64').toString();
			if (id.search(/\D/g) !== -1) throw String('Not even remotely a snowflake.');
			url = `https://discordapp.com/api/v6/users/${id}`;
			auth = `Bot ${client.conf.botToken}`;
		}
		const { body: user } = await get(url)
			.set('Authorization', auth);
		msg.edit(`${msg.content}\n\`\`\`js\n${user.username}#${user.discriminator} (${user.id})\`\`\``);
	} catch (error) {
		console.log(error);
		msg.edit(
			`${msg.content}\`\`\`js
${error.url ? `${error.status} ${error.statusText}\n${error.text}` : error}\`\`\``
		);
	}
};


exports.conf = {
	enabled: true,
	aliases: ['id', 'base64']
};


exports.help = {
	name: 'token',
	shortdescription: '-',
	description: '-',
	usage: '-'
};
