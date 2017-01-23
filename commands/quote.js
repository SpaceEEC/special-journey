const moment = require('moment');
moment.locale('de');
require('moment-duration-format');


exports.run = async (client, msg, params = []) => {
  try {
    let response = '';
    if (params[0].indexOf('|') !== -1) {
      response = params[0].substr(params[0].indexOf('|') + 1);
      params[0] = params[0].substr(0, params[0].indexOf('|'));
    }
    client.log(params[0]);
    const messages = await msg.channel.fetchMessages({ around: params[0], limit: 1 });
    const embed = new client.methods.Embed();
    embed.setAuthor(messages.first().member.displayName, messages.first().author.displayAvatarURL)
      .setColor(messages.first().member.highestRole.color)
      .setFooter(`Nachricht gesendet vor: ${moment.duration(+new Date() - messages.first().createdTimestamp).format(' D [Tage], H [Stunden], m [Minuten], s [Sekunden]')}`)
      .setDescription(messages.first().content);
    if (params[1]) {
      params = params.slice(1);
      let breakvar = false;
      for (const i in params) {
        if (params[i].includes('|') && params[i].indexOf('|') === 0) {
          response = params.slice(i).join(' ').substr(1);
          break;
        } else if (params[i].includes('|')) {
          response = params[i].substr(params[i].indexOf('|') + 1) + params.slice(i + 1);
          params[i] = params[i].substr(0, params[i].indexOf('|'));
          breakvar = true;
        }
        const add = await msg.channel.fetchMessages({ around: params[i], limit: 1 });
        embed.addField(add.first().member.displayName, add.first().content);
        if (breakvar) break;
      }
    }
    await msg.edit(response, { embed: embed });
  } catch (e) {
    client.log(require('util').inspect(e, false, 0));
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
  name: 'quote',
  shortdescription: '-',
  description: '-',
  usage: '-',
};
