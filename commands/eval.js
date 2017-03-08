exports.run = async (client, msg, params = []) => {
  const time = new Date().getTime();
  try {
    let evaled;
    if (msg.cmd === 'async') evaled = eval(`(async()=>{${params.join(' ')}})();`);
    else evaled = eval(params.join(' '));
    if (evaled instanceof Promise) {
      if (msg.cmd === 'eval') await evaled;
      else evaled = await evaled;
    }
    if (msg.cmd === 'sile') return;
    const response_typeof = typeof evaled;
    if (typeof evaled !== 'string') {
      evaled = client.inspect(evaled, false, 0);
    }
    if (evaled.includes(client.token)) {
      msg.edit('Was willst du damit anstellen? 👀.');
      return;
    }
    await msg.edit(`${msg.content}

\`evaled\\returned:\` \`typeof: ${response_typeof}\`
\`\`\`js
${evaled}
\`\`\`
Ausführungszeitraumslänge: \`${new Date().getTime() - time}\`ms`);
  } catch (e) {
    msg.edit(`${msg.content}

\`E-ROHR\`
\`\`\`js
${e}${e.response && e.response.res && e.response.res.text ? `\n${e.response.res.text}` : ''}
\`\`\`
Versuchungszeitraumslänge: \`${new Date().getTime() - time}\`ms`)
      .catch(err => client.discard(err));
  }
};


exports.conf = {
  enabled: true,
  aliases: ['await', 'async', 'sile'],
};


exports.help = {
  name: 'eval',
  shortdescription: '-',
  description: '-',
  usage: '-',
};
