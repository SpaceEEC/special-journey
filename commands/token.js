exports.run = async (client, msg, params = []) => { // eslint-disable-line
	msg.cmd = 'rasync';
	params = ['const', 'u', '=', 'await', 'this.client.fetchUser(', `'${Buffer.from(params[0].split('.')[0], 'base64')}'`,
		');', 'return', '`${u.username}#${u.discriminator}', '(${u.id})`']; // eslint-disable-line
	client.commands.get('reval').run(client, msg, params);
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
