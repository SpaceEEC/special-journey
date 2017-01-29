exports.run = async (client, msg, params = []) => {
  const time = new Date().getTime();
  try {
    const code = params.join(' ');
    let evaled = eval(code);
    if (evaled instanceof Promise) evaled = await evaled;
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
${e}${e.response && e.response.res && e.response.res.text ? `\n${JSON.parse(e.response.res.text).content}` : ''}
\`\`\`
Versuchungszeitraumslänge: \`${new Date().getTime() - time}\`ms`)
      .catch(err => client.discard(err));
  }
};


exports.conf = {
  enabled: true,
  aliases: [],
};


exports.help = {
  name: 'eval',
  shortdescription: '-',
  description: '-',
  usage: '-',
};
