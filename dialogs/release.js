const jdata = require('../data/object.json');
const {setBotStatusOpen} = require('./helperFunctions');

module.exports = async function release (message, bot, robot, userid) {
  const bsrch = jdata.filter(bot => bot.name === robot);
  if (!bsrch.length) {
    await bot.reply(message, `"${robot}" doesn't exist in the list`);
  } else {
    const botidx = jdata.findIndex(bot => bot.name === robot);
    if (jdata[botidx].resname === userid || message.user == 'UBM663REW') {
      setBotStatusOpen(jdata, botidx);
      await bot.reply(message, `${userid} released ${robot}`);
    } else {
      await bot.reply(message, 'You can not release a robot that you do not have reserved');
    }
  }
};
