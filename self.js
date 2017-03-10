// const Discord = require('../discord.js/src/index.js');
const Discord = require('discord.js');
const fs = require('fs-extra-promise');
const moment = require('moment');
moment.locale('de');
require('moment-duration-format');
const client = new Discord.Client({
  disabledEvents: [
    'USER_NOTE_UPDATE',
    'VOICE_STATE_UPDATE',
    'TYPING_START',
    'RELATIONSHIP_ADD',
    'RELATIONSHIP_REMOVE'
  ],
  disableEveryone: true
});
client.conf = JSON.parse(fs.readFileSync('./var/config.json', 'utf8'));

client.log = (msg) => console.log(`[${moment().format('DD.MM.YYYY HH:mm:ss')}]: ${msg}`);
client.err = (msg) => console.error(`[${moment().format('DD.MM.YYYY HH:mm:ss')}]: ${msg}`);
client.inspect = (obj, hidden = false, depth = 0) => require('util').inspect(obj, hidden, depth);
client.discard = () => { }; // eslint-disable-line no-empty-function

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

client.methods = {};
client.methods.moment = moment;
client.methods.Embed = Discord.RichEmbed;
client.methods.Collection = Discord.Collection;
client.methods.Constants = Discord.Constants;

fs.readdirAsync('./commands/')
  .then((files) => {
    files = files.filter(f => f.slice(-3) === '.js');
    client.log(`Lade insgesamt ${files.length} Befehle.`);
    for (const f of files) {
      try {
        const props = require(`./commands/${f}`);
        client.commands.set(props.help.name, props);
        for (const alias of props.conf.aliases) {
          client.aliases.set(alias, props.help.name);
        }
      } catch (e) {
        client.err(`Fehler beim Laden von ${f}.js\n${e.stack ? e.stack : e}`);
      }
    }
  });

client.on('message', async (msg) => {
  if (msg.author.id !== client.user.id) return;
  if (!msg.content.startsWith(client.conf.prefix)) return;
  const command = msg.content.split(' ')[0].slice(client.conf.prefix.length).toLowerCase();
  const params = msg.content.split(' ').slice(1);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    msg.cmd = command;
    cmd.run(client, msg, params);
  }
});

client.once('ready', () => {
  client.user.setStatus('invisible');
  client.user.email = '「ｒｅｄａｃｔｅｄ」';
  client.user.friends = '「ｒｅｄａｃｔｅｄ」';
  client.user.notes = '「ｒｅｄａｃｔｅｄ」';
  client.user.blocked = '「ｒｅｄａｃｔｅｄ」';
  client.log(`(${client.conf.prefix}): [${moment().format('DD.MM.YYY HH:mm:ss')}]: Stalke ${client.users.size} Nutzer, in ${client.channels.size} Channeln von ${client.guilds.size} Servern.`);
});

client.on('disconnect', (event) => {
  client.log(`Disconnected nach ${moment.duration(client.uptime).format(' D [Tage], H [Stunden], m [Minuten], s [Sekunden]')}.
CloseEvent code: ${event.code}`);
  // process.exit(237); -- no process manager locally installed
});

process.on('unhandledRejection', (err) => {
  if (err.response && err.response.res && err.response.res.text) client.err(`Uncaught Promise Error:\n$ ${err.response.res.text}`);
  else client.err(`Uncaught Promise Error:\n${err.stack ? err.stack : err}`);
});

client.login(client.conf.token);
