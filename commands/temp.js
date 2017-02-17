const Canvas = require('../../glowing-potato/node_modules/canvas/index.js');
const request = require('superagent');
const fs = require('fs-extra-promise');
exports.run = async (client, msg, params = []) => {
  const ow = new Overwatch(client);
  ow.run(msg, params);
};

class Overwatch {
  constructor(bot) {
    this.bot = bot;
  }
  async run(msg, params) { // eslint-disable-line consistent-return
    if (!params[0] || !/^\S+[#|-]\d{4,5}/.test(params[0])) {
      return msg.channel.sendMessage('Kein gültiger BattleTag angegeben.');
    }

    let data = await this.getData(params[0]);

    if (typeof data === 'number') {
      return msg.channel.sendMessage(data === 404 ? 'Dieser BattleTag wurde nicht gefunden!'
        : `Der Server meldet folgenden Statuscode: \`${data}\`
\nKontaktiere falls nötig \`${this.bot.config.owner}\``);
    }
    data = data.eu || data.us || data.kr || data.any;
    // const mostPlayed = this.getMostPlayedHero(data.heroes.playtime);
    let stats = this.getStatsForHero(data.heroes.stats, 'dva');
    stats = this.formatDetails(stats, 'dva');
    // mostPlayed);

    const Image = Canvas.Image;
    const canvas = new Canvas(200, 200);
    const ctx = canvas.getContext('2d');

    const champ = new Image();
    const ult = new Image();
    const mech = new Image();
    const block = new Image();

    const triggered = () => {
      let i = 0;
      ctx.patternQuality = 'billinear';
      ctx.filter = 'bilinear';
      ctx.antialias = 'subpixel';
      ctx.textAlign = 'left';

      ctx.font = '10px Roboto';
      ctx.fillStyle = '#FFFFFF';

      ctx.drawImage(champ, 63, 3, 138, 197);

      ctx.drawImage(mech, 5, 85, 30, 30);
      ctx.fillText(`MAX: ${stats[i++]}`, 40, 85);
      ctx.fillText(`AVG: ${stats[i++]}`, 40, 100);
      ctx.fillText(`SUM: ${stats[i++]}`, 40, 115);

      ctx.drawImage(ult, 5, 27, 30, 30);
      ctx.fillText(`MAX: ${stats[i++]}`, 40, 27);
      ctx.fillText(`AVG: ${stats[i++]}`, 40, 42);
      ctx.fillText(`SUM: ${stats[i++]}`, 40, 57);

      ctx.drawImage(block, 5, 143, 30, 30);
      ctx.fillText(`MAX: ${stats[i++]}`, 40, 143);
      ctx.fillText(`AVG: ${stats[i++]}`, 40, 158);
      ctx.fillText(`SUM: ${stats[i++]}`, 40, 173);

      ctx.textAlign = 'right';
      ctx.fillText(`${stats[i++]}h`, 195, 25);
    };
    champ.src = await this.loadFile('dva');
    ult.src = await this.loadFile('dva_ult');
    mech.src = await this.loadFile('dva_mech');
    block.src = await this.loadFile('dva_block');
    await triggered();
    msg.channel.sendFile(canvas.toBuffer());
  }

  loadFile(file) {
    return fs.readFileAsync(`../misc/${file}.png`);
  }

  getStatsForHero(raw, mostPlayed) {
    const stats = new this.bot.methods.Collection();
    for (let mode in raw) {
      if (!Object.keys(raw[mode]).length) continue;
      mode = raw[mode][mostPlayed];
      for (let type in mode) {
        type = mode[type];
        for (const stat in type) {
          const statv = type[stat];
          if (stats.has(stat)) stats.set(stats.get(stat) + statv);
          else stats.set(stat, statv);
        }
      }
    }
    return stats;
  }

  getMostPlayedHero(playtimes) {
    const playtime = {};
    for (let mode in playtimes) {
      mode = playtimes[mode];
      for (const hero in mode) {
        if (!playtime[hero]) playtime[hero] = mode[hero];
        else playtime[hero] += mode[hero];
      }
    }
    return Object.keys(playtime).reduce((a, b) => playtime[a] > playtime[b] ? a : b);
  }

  getData(tag) {
    return new Promise(resolve => {
      request.get(`https://owapi.net/api/v3/u/${tag.replace('#', '-')}/blob`).send(null).set('Accept', 'application/json')
        .end((err, res) => {
          if (err) {
            if (err.response.status !== 404) this.bot.err(`[overwatch] [getData]: ${this.bot.inspect(err.response.error)}`);
            resolve(err.response.status);
          } else {
            resolve(res.body);
          }
        });
    });
  }

  formatDetails(stats, champ) {
    const values = this.getDetailNamesForChamp(champ);
    const arr = [];
    for (const value of values) {
      let arrValue = (stats.get(value) || 'N/A').toLocaleString();
      if (arrValue.indexOf('.') !== -1) arrValue = arrValue.substr(0, arrValue.indexOf('.') + 3);
      arr.push(arrValue);
    }
    return arr;
  }

  getDetailNamesForChamp(champ) {
    const champs = {
      dva: ['mechs_called_most_in_game', 'mechs_called_average', 'mechs_called',
        'self_destruct_kills_most_in_game', 'self_destruct_kills_average', 'self_destruct_kills',
        'damage_blocked_most_in_game', 'damage_blocked_average', 'damage_blocked',
        'time_played']
    };
    return champs[champ];
  }

}

exports.conf = {
  enabled: true,
  aliases: [],
};


exports.help = {
  name: 'temp',
  shortdescription: '-',
  description: '-',
  usage: '-',
};
