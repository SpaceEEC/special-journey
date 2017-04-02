const { get } = require('snekfetch');

exports.run = async (client, msg, params = []) => {
	try {
		const id = Buffer.from(params[0].split('.')[0], 'base64').toString();
		if (id.search(/\D/g) !== -1) throw String('Not even remotely a snowflake.');
		const { body: user } = await get(`https://discordapp.com/api/users/${id}`)
			.set('Authorization', `Bot ${client.conf.botToken}`);
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
	aliases: []
};


exports.help = {
	name: 'token',
	shortdescription: '-',
	description: '-',
	usage: '-'
};
