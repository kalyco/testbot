const {BotkitConversation} = require('botkit');
const jdata = require('../data/object.json');
const {setBuildingForItem} = require('./helperFunctions');

module.exports = function addToolDialog (message, tool, bot, controller) {
  const convo = new BotkitConversation('add tool(.*)', controller);
  const bsrch = jdata.filter((items) => items.name === tool);

  if (!bsrch.length) {
    convo.say('tool_building_thread');
  } else {
    convo.say(`${tool} already exists at ${jdata.find((items) => items.name === tool).building}`);
  }

  convo.addQuestion('Which building is ' + tool + ' in?', [
    {
      pattern: '271',
      handler: async () => {
        const buildingMsg = setBuildingForItem('271', jdata, tool);
        await bot.reply(message, buildingMsg);
      }
    },
    {
      pattern: '117',
      handler: async () => {
        const buildingMsg = setBuildingForItem('117', jdata, tool);
        await bot.reply(message, buildingMsg);
      }
    },
    {
      default: true,
      handler: async () => {
        await convo.gotoThread('tool_bad_response');
      }
    }
  ], {}, 'tool_building_thread');

  convo.addMessage({
    text: 'Which building is ' + tool + ' in, 117 or 271?',
    action: 'tool_building_thread'
  }, 'tool_bad_response');

  return convo;
};
