const { post } = require('superagent');
exports.run = async (client, msg, params = []) => { // eslint-disable-line
	const { body: response } = await post(`https://api.kurisubrooks.com/api/compute/convert`)
		.send({ query: params.join(' ') })
		.set({ 'Content-Type': 'application/json', Authorization: client.conf.sherlock });
	msg.edit(`${response.input.display} <=> ${response.output.display}`);
};


exports.conf = {
	enabled: true,
	aliases: []
};


exports.help = {
	name: 'convert',
	shortdescription: '-',
	description: '-',
	usage: '-'
};
