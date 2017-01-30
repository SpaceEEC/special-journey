const SnowflakeUtil = require('../node_modules/discord.js/src/util/Snowflake.js');
const moment = require('moment');
moment.locale('de');
require('moment-duration-format');

exports.run = async (client, msg, params = []) => {
  if (!params[0]) return msg.edit(`${msg.content} 👀`);
  const snowflake = SnowflakeUtil.deconstruct(params[0]);
  const date = moment(snowflake.date).format('DD.MM.YYYY HH:mm:ss [(CET)]');
  return msg.edit(`${msg.content}
  \`\`\`LDIF
Date: ${date}\`\`\``);
};


exports.conf = {
  enabled: true,
  aliases: ['snow'],
};


exports.help = {
  name: 'snowflake',
  shortdescription: '-',
  description: '-',
  usage: '-',
};
