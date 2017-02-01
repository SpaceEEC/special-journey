// Much thanks to Kurisu (http://kurisubrooks.com/) for the API!
const request = require('superagent');

exports.run = async (client, msg, params = []) => {
  const obj = {};
  if (!params[0]) return msg.edit(`${msg.content}\n\nUnvollständig.`);
  if (params[0].match(/^-..$/)) {
    obj.to = params.shift().replace('-', '');
    if (!langs.includes(obj.to)) return msg.edit(`${msg.content}\n\nUnbekannte Sprache \`${obj.to}\`!`);
  }
  if (params[0].match(/^-..$/)) {
    obj.from = params.shift().replace('-', '');
    if (!langs.includes(obj.from)) return msg.edit(`${msg.content}\n\nUnbekannte Sprache \`${obj.from}\`!`);
  }
  if (!params[0]) return msg.edit(`${msg.content}\n\nUnvollständig.`);
  obj.query = params.join(' ');
  const res = await request.post(`https://api.kurisubrooks.com/api/translate`)
    .send(obj)
    .set('Content-Type', 'application/json');
  if (res.body.ok) {
    return msg.edit('', {
      embed:
      new client.methods.Embed()
        .setColor(0xb89bf8)
        .setAuthor(`API by Kurisu`, 'http://kurisubrooks.com/favicon.ico', 'http://kurisubrooks.com/')
        .addField(`From ${res.body.from.name} (${res.body.from.local})`, res.body.query)
        .addField(`To ${res.body.to.name} (${res.body.to.local})`, res.body.result)
    });
  } else {
    return msg.edit(`${msg.content}
\`\`\`LDIF
${res.body.error}
\`\`\``);
  }
};

// Are all of them even supported by Kurisu? (I could swear there were less of them in the source of the api.)
const langs = ['af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bn', 'bs', 'bg', 'ca',
  'ceb', 'ny', 'zh-CN', 'zh-TW', 'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'tl', 'fi',
  'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'haw', 'iw', 'hi', 'hmn', 'hu', 'is',
  'ig', 'id', 'ga', 'it', 'ja', 'jw', 'kn', 'kk', 'km', 'ko', 'ku', 'ky', 'lo', 'la', 'lv',
  'lt', 'lb', 'mk', 'mg', 'ms', 'ms', 'ml', 'mi', 'mr', 'mn', 'my', 'ne', 'no', 'ps', 'fa',
  'pl', 'pt', 'ma', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es',
  'su', 'sw', 'sv', 'tg', 'ta', 'te', 'th', 'tr', 'uk', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu'];


exports.conf = {
  enabled: true,
  aliases: ['t'],
};


exports.help = {
  name: 'translate',
  shortdescription: '-',
  description: '-',
  usage: '-',
};
