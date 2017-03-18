exports.run = async (client, msg, params = []) => {
	const request = await client.channels.get(client.conf.bevalID).send(`${msg.cmd.replace('r', client.conf.botPrefix)} ${params.join(' ')}`);
	const fetched = (await request.channel.awaitMessages(m => m.author.id === client.conf.botID, { time: 5000, maxMatches: 1 })).first();
	if (!fetched) {
		msg.edit(`${msg.content}\n🕐.`);
	} else {
		const stuff = fetched.content.split('```js');
		if (stuff[2]) {
			msg.edit(`${msg.content}

\`evaled\\returned:\` \`typeof: ${stuff[3].split('```')[0].slice(1)}\`
\`\`\`js
${stuff[2].split('```')[0]}
\`\`\`
Ausführungszeitraumslänge: \`${stuff[3].split(' `')[1][0]}\`ms`);
		} else {
			msg.edit(`${msg.content}

\`E-ROHR\`
\`\`\`js
${stuff[1].split('```')[0]}
\`\`\`
Versuchungszeitraumslänge: \`${stuff[1].split(' `')[1][0]}\`ms`);
		}
	}
};


exports.conf = {
	enabled: true,
	aliases: ['rawait', 'rasync'],
};


exports.help = {
	name: 'reval',
	shortdescription: '-',
	description: '-',
	usage: '-',
};
