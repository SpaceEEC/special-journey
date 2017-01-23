exports.run = async (client, msg, params = []) => {
  try {
    delete require.cache[require.resolve(`../commands/${params[0]}`)];
    const cmd = require(`../commands/${params[0]}`);
    client.commands.delete(params[0]);
    client.aliases.forEach((cmd2, alias) => {
      if (cmd2 === params[0]) client.aliases.delete(alias);
    });
    client.commands.set(params[0], cmd);
    cmd.conf.aliases.forEach(alias => {
      client.aliases.set(alias, cmd.help.name);
    });
    msg.delete();
  } catch (e) {
    msg.edit(`${msg.content}

\`E-ROHR\`
\`\`\`js
${e}
\`\`\``);
  }
};


exports.conf = {
  enabled: true,
  aliases: [],
};


exports.help = {
  name: 'reload',
  shortdescription: '-',
  description: '-',
  usage: '-',
};
