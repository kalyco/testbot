require('dotenv').config();
const {
  addToolDialog,
  addBotDialog,
  remove,
  transfer,
  ReserveDialog,
  displayStatus,
  release,
} = require('./dialogs/index');
const timezone = require('moment-timezone');
const moment = require('moment');
moment.tz.setDefault('America/New_York');

module.exports = function (controller) {
  controller.hears(
    ['add tool (.*)'],
    ['direct_mention', 'mention', 'direct_message'],
    async (bot, message) => {
      const tool = message.text.split(' ')[2].toLowerCase();
      const regex = /\b^[\w-]{1,25}$\b/;
      if (regex.test(tool)) {
        controller.addDialog(addToolDialog(message, tool, bot, controller));
        await bot.beginDialog('add tool(.*)');
      } else {
        await bot.reply(message, 'You must enter a name that is 25 or less characters with no spaces');
      }
    }
  );

  controller.hears(
    ['add (.*)'],
    ['direct_mention', 'mention', 'direct_message'],
    async (bot, message) => {
      const robot = message.text.split(' ')[1].toLowerCase();
      const regex = /\b^[\w-]{1,10}$\b/;
      if (regex.test(robot)) {
        const botDialog = await addBotDialog(message, robot, bot, controller);
        controller.addDialog(botDialog);
        await bot.beginDialog('add (.*)');
      } else {
        await bot.reply(message, 'You must enter a name that is 10 or less characters with no spaces');
      }
    }
  );

  controller.hears(
    ['remove (.*)'],
    ['direct_mention', 'mention', 'direct_message'],
    async (bot, message) => {
      const robot = message.text.split(' ')[1].toLowerCase();
      await remove(message, bot, robot);
    }
  );

  controller.hears(
    ['transfer (.*)'],
    ['direct_mention', 'mention', 'direct_message'],
    async (bot, message) => {
      const robot = message.text.split(' ')[1].toLowerCase();
      await transfer(message, bot, robot);
    }
  );

  controller.hears(
    ['reserve (.*)'],
    ['direct_mention', 'mention', 'direct_message'],
    async (bot, message) => {
      const robot = message.text.split(' ')[1].toLowerCase();
      const userid = '<@' + message.user + '>';
      const reserveDialog = new ReserveDialog(bot, message, robot, userid, controller);
      const convo = reserveDialog.getConvo();
      controller.addDialog(convo);
      await bot.beginDialog('reserve (.*)');
    }
  );

  controller.hears(
    ['release (.*)'],
    ['direct_mention', 'mention', 'direct_message'],
    async (bot, message) => {
      const robot = message.text.split(' ')[1].toLowerCase();
      const userid = '<@' + message.user + '>';
      await release(message, bot, robot, userid);
    }
  );

  controller.hears(
    ['(.*)stat'],
    ['direct_mention', 'mention', 'direct_message'],
    async (bot, message) => {
      await displayStatus(message, bot);
    }
  );

  controller.hears(
    ['hello', 'hi', 'greetings'],
    ['direct_mention', 'mention', 'direct_message'],
    async (bot, message) => {
      await bot.reply(message, 'Greetings, Professor.\nI am chuckbot and will walk you through adding or removing information to my reservation list.\nFor more information, please type help');
    }
  );

  controller.hears(
    ['play', 'game', 'thermonuclear', 'war'],
    ['direct_mention', 'mention', 'direct_message'],
    async (bot, message) => {
      await bot.reply(message, 'How about a nice game of chess?');
    }
  );

  controller.hears(
    ['help', '?'],
    ['direct_mention', 'mention', 'direct_message'],
    async (bot, message) => {
      await bot.reply(message,
        'Chuckbot is a conversational Slack bot that will walk you through interacting with the reservation system\n' +
                'If extra information is needed, Chuckbot ask you questions to recieve additional data\n\n' +
                'Your command options are listed below:\n' +
                'Basic Messages and Reports\n' +
                '\thello: chuckbot will greet you\n' +
                '\thelp: chuckbot will print the message you are currently reading\n' +
                '\tstatus: list chucks and reservation status\n' +
                '\tchuck status: list information for specific chuck\n' +
                'Reserving and Releasing a Chuck\n' +
                '\treserve chuck: chuckbot will walk you through steps to reserve a bot\n' +
                '\trelease chuck: remove your reservation information from a chuck\n' +
                'Adding and Removing Chucks From the System\n' +
                '\tadd chuck: chuckbot will walk you through adding new chuck to list\n' +
                '\tremove chuck: chuckbot will walk you through removing an old chuck from the list\n' +
                '\ttransfer chuck: chuckbot will move a chuck to the other building in the list\n'
      );
    }
  );
};
