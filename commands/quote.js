exports.run = async (client, msg, params = []) => {
  try {
    let response = '';
    let color = 0;
    let channel = msg.channel;
    if (params[0].startsWith('0x')) {
      color = params.shift();
    } else if (client.methods.Constants.Colors[params[0].toUpperCase()]) {
      color = client.methods.Constants.Colors[params.shift().toUpperCase()];
    } else if (params[0].toLowerCase() === 'random') {
      color = Math.floor(Math.random() * (0xFFFFFF + 1));
      params.shift();
    }
    if (params[0].startsWith('-c')) {
      channel = client.channels.get(params.slice(1).shift());
      params = params.slice(2);
    }
    if (params[0].search(/\D/g) !== -1) {
      response = params[0].substr(params[0].search(/\D/g) + 1);
      params[0] = params[0].substr(0, params[0].search(/\D/g));
    }
    let fetched = await channel.fetchMessages({ around: params[0], limit: 1 });
    fetched = fetched.first();
    if (fetched.guild) fetched.member = await channel.guild.fetchMember(fetched.author);
    const embed = new client.methods.Embed();
    embed.setAuthor(`${fetched.member ? fetched.member.displayName : fetched.author.username} ${getTime(client, fetched.createdAt)}`, fetched.author.displayAvatarURL, client.conf.github)
      .setColor(color || getColorForPlebsLikeCrawl(fetched.member))
      .setDescription(fetched.content);
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
        let add = await channel.fetchMessages({ around: params[i], limit: 1 });
        add = add.first();
        if (add.guild) add.member = await channel.guild.fetchMember(add.author);
        embed.addField(`${add.member ? add.member.displayName : add.author.username} ${getTime(client, add.createdAt)}`, add.content);
        if (breakvar) break;
      }
    }
    if (!embed.fields.length) {
      if (fetched.embeds && fetched.embeds[0] && fetched.embeds[0].thumbnail && fetched.embeds[0].thumbnail.url) {
        embed.setDescription(embed.description.replace(fetched.embeds[0].thumbnail.url, ''));
        embed.setImage(fetched.embeds[0].thumbnail.url);
      } else if (fetched.attachments.size && fetched.attachments.first() && fetched.attachments.first().url) {
        embed.setImage(fetched.attachments.first().url);
      }
    }
    await msg.edit(response, { embed: embed });
  } catch (e) {
    msg.edit(`${msg.content}

\`E-ROHR\`
\`\`\`js
${e}${e.response && e.response.res && e.response.res.text ? `\n${e.response.res.text}` : ''}
\`\`\``);
  }
};


function getTime(client, time) {
  if (!client.methods.moment(time).isSame(new Date(), 'day')) time = client.methods.moment(time).format('DD.MM.YYYY - hh:mm');
  else time = client.methods.moment.duration(time - client.methods.moment(time).startOf('day')).format('hh:mm');
  if (time.length === 2) time = `00:${time}`;
  return `(${time} CET)`;
}


// thanks and credits for shorter version goes to Gus#0291 and 1Computer#7952
function getColorForPlebsLikeCrawl(member) {
  if (!member) return 0;
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
