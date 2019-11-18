const axios = require('axios');
const jdata = require('../data/object.json');
const {getBotStats} = require('./helperFunctions');

module.exports = async function displayStatus (message, bot) {
  const bots271 = [];
  const bots117 = [];
  const tools = [];
  if (message.text.split(' ')[0].includes('stat')) {
    for (const bot of jdata) {
      if (bot.building === '271' && bot.testTool === 'no') {
        bots271.push(bot);
      } else if (bot.building === '117' && bot.testTool === 'no') {
        bots117.push(bot);
      } else if (bot.testTool === 'yes') {
        tools.push(bot);
      }
    }

    const sortWave = bots271.sort(sortN);
    const sortBeav = bots117.sort(sortN);
    const sortTool = tools.sort(sortN);

    const attachments117 = pushBotsToZone(sortBeav, '*Robots in 117*');
    const attachments271 = pushBotsToZone(sortWave, '*Robots in 271*');
    const attachmentsTools = pushBotsToZone(sortTool, '*Test Tools*');

    await bot.reply(message, attachmentsTools);
    await bot.reply(message, attachments117);
    await bot.reply(message, attachments271);
  } else if (jdata.filter(bot => bot.name === message.text.split(' ')[0])) {
    const robot = message.text.split(' ')[0].toLowerCase();
    try {
      const mfpInfo = await getMfpInfo(robot);
      if (mfpInfo.name === robot) {
        const attachmentsStats = getBotStats(mfpInfo);
        await bot.reply(message, attachmentsStats);
      } else {
        await bot.reply(message, 'No chuck found');
      }
    } catch (error) {
      console.log('error: ' + error);
      await bot.reply(message, 'No chuck found.');
    }
  } else {
    await bot.iply(message, 'Something went wrong, try again');
  }
};

function sortN (a, b) {
  if (a.name === b.name) {
    return 0;
  }
  return (a.name > b.name) ? 1 : -1;
}

function pushBotsToZone (bots, attachmentText) {
  const attachmentZone = {
    text: attachmentText,
    attachments: []
  };
  for (const b of bots) {
    let attach = {};
    switch (b.status) {
    case 'reserved':
      attach = {
        text: b.name + ' - ' + b.comment,
        color: 'danger',
        footer: 'reserved by ' + b.resname + ' on ' + b.restime + ' for ' + b.reslimit + ' hours'
      };
      break;
    case 'open':
      attach = {
        title: b.name,
        color: 'good'
      };
      break;
    case 'hold':
      attach = {
        text: b.name + ' - ' + b.comment,
        color: '#A9A9A9',
        footer: 'on hold by ' + b.resname + ' on ' + b.holdtime
      };
      break;
    }
    attachmentZone.attachments.push(attach);
  }
  return attachmentZone;
}

async function getMfpInfo (robot) {
  const response = await axios.get('https://grm.6river.org/v1//MfpConfigs/findOne', {
    headers: {
      Authorization: process.env.GRM_AUTH
    },
    params: {
      filter: {
        include: ['site'],
        where: {name: robot}
      }
    }
  });
  return response.data;
}
