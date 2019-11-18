const jdata = require('../data/object.json');
const {writeData} = require('./helperFunctions');

module.exports = async function transfer (message, bot, robot) {
  const botidx = jdata.findIndex(bot => bot.name === robot);
  const bsrch = jdata.filter(bot => bot.name === robot);
  if (!bsrch.length) {
    await bot.reply(message, `"${robot}" doesn't exist in the list`);
  } else {
    jdata[botidx].building = (bot.building === '117' ? '271' : '117');
    writeData('../data/object.json', jdata);
    await bot.reply(message, `Moved ${robot} to ${jdata[botidx].building}`);
  }
};
