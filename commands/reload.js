exports.run = async (client, msg, params = []) => {
  if (!params[0]) {
    return msg.edit(`${msg.content} 👀`);
  }
  try {
    delete require.cache[require.resolve(`../commands/${params[0]}`)];
    const cmd = require(`../commands/${params[0]}`);
    client.commands.delete(params[0]);
    client.aliases.forEach((cmd2, alias) => {
      if (cmd2 === params[0]) client.aliases.delete(alias);
    });
    client.commands.set(params[0], cmd);
    for (const alias of cmd.conf.aliases) {
      client.aliases.set(alias, cmd.help.name);
    }
    return msg.delete();
  } catch (e) {
    return msg.edit(`${msg.content}

\`E-ROHR\`
\`\`\`js
${e}
\`\`\``);
  }
};


exports.conf = {
  enabled: true,
  aliases: ['relaod'],
};


exports.help = {
  name: 'reload',
  shortdescription: '-',
  description: '-',
  usage: '-',
};
