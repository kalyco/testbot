const jdata = require('../data/object.json');
const {writeData} = require('./helperFunctions');

module.exports = async function remove (message, bot, robot) {
  const otherBotData = jdata.filter(bot => bot.name !== robot);
  const bsrch = jdata.filter(bot => bot.name === robot);
  if (!bsrch.length) {
    await bot.reply(message, `"${robot}" doesn't exist in the list`);
  } else {
    const botloc = jdata.find((bot) => bot.name === robot).building;
    writeData('../data/object.json', otherBotData);
    await bot.reply(message, `${robot} has been removed from ${botloc}`);
  }
};
