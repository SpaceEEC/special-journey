exports.run = async (client, msg, params = []) => {
  const todoMsg = (await client.channels.get(client.conf.todoChannel).fetchMessages({ around: client.conf.todoMessage, limit: 1 })).filter(m => m.id === client.conf.todoMessage).first();
  const fields = todoMsg.embeds[0].fields;
  if (!params[0]) {
    params[0] = 'lazyness';
  }
  if (!isNaN(params[0])) {
    if (!fields[parseInt(params[0]) - 1]) {
      msg.edit(`Eintrag nicht gefunden.`);
    } else {
      msg.edit(`Eintrag \`${params[0]}:\``, {
        embed: new client.methods.Embed().setColor('RANDOM')
          .addField(fields[parseInt(params[0]) - 1].name, fields[parseInt(params[0]) - 1].value)
      });
    }
  } else if (params[0] === 'edit') {
    if (!isNaN(params[1]) && fields[parseInt(params[1]) - 1] && params[2]) {
      fields[parseInt(params[1]) - 1].value = params.slice(2).join(' ');
      const e = new client.methods.Embed();
      e.setColor('RANDOM').setTitle('To-do-list').setDescription('\u200b');
      for (const field of fields) e.addField(field.name, field.value);
      todoMsg.edit({ embed: e });
      msg.edit(`Edited: ${fields[parseInt(params[1]) - 1].name}`);
    }
  } else if (params[0] === 'add') {
    if (params[1] && params.slice(1).join(' ').split('|')[1]) {
      fields.push({ name: params.slice(1).join(' ').split('|')[0], value: params.slice(1).join(' ').split('|')[1] });
      const e = new client.methods.Embed();
      e.setColor('RANDOM').setTitle('To-do-list').setDescription('\u200b')
        .setFooter('\u200b');
      for (const field of fields) e.addField(field.name, field.value);
      todoMsg.edit({ embed: e });
      msg.edit(`Added Entry \`${fields.length}\``, { embed: new client.methods.Embed().setColor('RANDOM').addField(fields[fields.length - 1].name, fields[fields.length - 1].value) });
    } else {
      msg.edit(`${msg.content} \n\nSomething is missing tho.`);
    }
  } else if (params[0] === 'remove') {
    if (fields[parseInt(params[1]) - 1]) {
      const removed = fields.splice(parseInt(params[1]) - 1, 1)[0].name;
      const e = new client.methods.Embed();
      e.setColor('RANDOM').setTitle('To-do-list').setDescription('\u200b')
        .setFooter('\u200b');
      for (const field of fields) e.addField(field.name, field.value);
      todoMsg.edit({ embed: e });
      msg.edit(`Removed entry: ${removed}`);
    } else {
      msg.edit(`Entry not found.`);
    }
  } else if (params[0] === 'list') {
    const e = (new client.methods.Embed()).setColor('RANDOM');
    for (const i in fields) e.addField(`\`${parseInt(i) + 1}\`: ${fields[i].name}`, fields[i].value);
    msg.edit('To-do-list', { embed: e });
  } else {
    msg.edit(`${fields.length} thing${fields.length === 1 ? '' : 's'} to do.`);
  }
};


exports.conf = {
  enabled: true,
  aliases: ['doshit'],
};


exports.help = {
  name: 'todo',
  shortdescription: '-',
  description: '-',
  usage: '-',
};
