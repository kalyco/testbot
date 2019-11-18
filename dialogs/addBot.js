const {BotkitConversation} = require('botkit');
const jdata = require('../data/object.json');
const {setBuildingForItem} = require('./helperFunctions');

module.exports = async function addBotDialog (message, robot, bot, controller) {
  const convo = new BotkitConversation('add (.*)', controller);
  const bsrch = jdata.filter((bots) => bots.name === robot);

  if (!bsrch.length) {
    convo.addQuestion('Which building is ' + robot + ' in?', [
      {
        pattern: '271',
        type: 'string',
        handler: async (response, convo, bot) => {
          const buildingMsg = setBuildingForItem('271', jdata);
          await bot.reply(message, buildingMsg);
        }
      },
      {
        pattern: '117',
        type: 'string', 
        handler: async (response, convo, bot) => {
          const buildingMsg = setBuildingForItem('117', jdata);
          await bot.reply(message, buildingMsg);
        }
      },
      {
        default: true,
        handler: async () => {
          await convo.gotoThread('bot_bad_response');
        }
      }
    ], 'building');
    
  } else {
    convo.say(`${robot} already exists at ${jdata.find((items) => items.name === robot).building}`);
  }

  convo.addMessage({
    text: 'Which building is ' + robot + ' in, 117 or 271?',
    action: 'building_thread'
  }, 'bot_bad_response');

  return convo;
};
