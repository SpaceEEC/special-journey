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
    const messages = await msg.channel.fetchMessages({ around: params[0], limit: 1 });
    messages.first().member = await msg.guild.fetchMember(messages.first().author);
    const embed = new client.methods.Embed();
    embed.setAuthor(`${messages.first().member.displayName} ${getTime(messages.first().createdAt)}`, messages.first().author.displayAvatarURL, client.conf.github)
      .setColor(getColorForPlebsLikeCrawl(messages.first().member))
      // .setFooter(`Nachricht gesendet vor ${moment.duration(+new Date() - messages.first().createdTimestamp).format(' D [Tagen,] H [Stunden,] m [Minuten und] s [Sekunden]')}`)
      .setDescription(messages.first().content);
    if (params[1]) {
      params = params.slice(1);
      let breakvar = false;
      for (const i in params) {
        if (params[i].search(/\D/g) === 0) {
          response = params.slice(i).join(' ');
          break;
        } else if (params[i].search(/\D/g) !== -1) {
          response = params[i].substr(params[i].search(/\D/g)) + params.slice(i + 1);
          params[i] = params[i].substr(0, params[i].search(/\D/g));
          breakvar = true;
        }
        const add = await msg.channel.fetchMessages({ around: params[i], limit: 1 });
        add.first().member = await msg.guild.fetchMember(add.first().author);
        embed.addField(`${add.first().member.displayName} ${getTime(add.first().createdAt)}`, add.first().content);
        if (breakvar) break;
      }
    }
    if (!embed.fields.length) {
      if (messages.first().embeds && messages.first().embeds[0] && messages.first().embeds[0].thumbnail && messages.first().embeds[0].thumbnail.url) {
        embed.setDescription(embed.description.replace(messages.first().embeds[0].thumbnail.url, ''));
        embed.setImage(messages.first().embeds[0].thumbnail.url);
      } else if (messages.first().attachments.size && messages.first().attachments.first() && messages.first().attachments.first().url) {
        embed.setImage(messages.first().attachments.first().url);
      }
    }
    await msg.edit(response, { embed: embed });
  } catch (e) {
    msg.edit(`${msg.content}

\`E-ROHR\`
\`\`\`js
${e}${e && e.response && e.response.res && e.response.res.text ? `\n${client.inspect(JSON.parse(e.response.res.text), false, 1)}` : ''}
\`\`\``);
  }
};


function getTime(time) {
  time = moment.duration(time - moment().startOf('day')).format('hh:mm');
  if (time.length === 2) time = `00:${time}`;
  return `(${time} CET)`;
}


// thanks and credits for shorter version goes to Gus#0291 and 1Computer#7952
function getColorForPlebsLikeCrawl(member) {
  const roles = member.roles.filter(r => r.color !== 0).array().sort((a, b) => a.position - b.position);
  return roles[roles.length - 1] ? roles[roles.length - 1].color : 0;
}


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
