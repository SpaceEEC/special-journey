exports.run = async (client, msg, params = []) => {
	msg.edit(msg.content, {
		embed: new client.methods.Embed()
			.setColor(0x0800ff)
			.setDescription('Befehlsausführungsvorgang läuft...')
	}).then(mes => {
		const exec = require('child_process');
		const time = +new Date;
		exec.exec(params.join(' '), (error, stdout, stderr) => {
			if (error) {
				mes.edit(`\`EXEC\`
\`\`\`xl
${params.join(' ')}
\`\`\`
${stdout ? `\`STDOUT\`\n\`\`\`xl\n${stdout}\`\`\`` : ''}
${error.stack ? `\`E-ROHR\`\n\`\`\`js\n${error.stack}\n\`\`\`` : ''}
${error.code ? `Error Code: ${error.code}` : ''}
${error.signal ? `Signal received: ${error.signal}` : ''}
`, {
	embed: new client.methods.Embed()
							.setColor(0xffff00)
							.setDescription(`Befehlsausführungszeitraumslänge: \`${new Date().getTime() - time}\`ms.`)
});
			} else {
				mes.edit(`\`EXEC\`
\`\`\`xl
${params.join(' ')}
\`\`\`
${stdout ? `\`STDOUT\`\n\`\`\`xl\n${stdout}\`\`\`` : ''}
${stderr ? `\`STERR\`\n\`\`\`xl\n${stderr}\`\`\`` : ''}
`, {
	embed: new client.methods.Embed()
							.setColor(0x00ff08)
							.setDescription(`Befehlsausführungszeitraumslänge: \`${new Date().getTime() - time}\`ms.`)
});
			}
		});
	});
};


exports.conf = {
	enabled: true,
	aliases: [],
};


exports.help = {
	name: 'exec',
	shortdescription: '-',
	description: '-',
	usage: '-',
};
