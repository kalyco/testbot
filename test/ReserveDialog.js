'use strict';
const assert = require('assert');
const sinon = require('sinon');
const ReserveDialog = require('../dialogs/reserve');
const Convo = require('../indexController.js');
const {BotMock, SlackApiMock} = require('botkit-mock');
const {SlackAdapter} = require('botbuilder-adapter-slack');

describe('ReserveDialog', () => {
  let reserveDialog;
  let robot = 'bernie';
  let bot;
  const user = 'user123';
  const channel = 'channel123';
  let controller;
  const sequence = [
    {
      user,
      channel,
      messages: []
    }
  ];
  beforeEach(async () => {
    this.userInfo = {
      slackId: 'user123',
      channel: 'channel123',
    };
    sequence[0].messages = [];
    const adapter = new SlackAdapter({
      clientSigningSecret: "4a1192dceb89dc5d2bedbfabba3f093a",
      botToken: "xoxb-332294953682-812432307092-r9H19Ojns7phQACq0An3xy8t",
      debug: true,
    });

    controller = new BotMock({
      adapter: adapter,
      disable_webserver: true,
    });
    SlackApiMock.bindMockApi(controller);
    Convo(controller);

    bot = await controller.spawn({
      type: 'slack',
    });
  });

  context('reservation', () => {
    it ('requires a reason for reserving', async() => {
      const msg = {
        text: 'reserve bernie',
        isAssertion: true,
        user: 'testUser',
      };
      sequence[0].messages.push(msg);
			
      const result = await controller.usersInput(sequence);
      const expected = "<@user123>, give a ticket or reason for reservation\nEx. FS-1724 or Need bot for movement loops";
      assert.strictEqual(result.text, expected);
    });
		
    it ('creates a reservation', async() => {
      const messages = [{
        text: 'reserve bernie',
        user: 'testUser',
        //isAssertion: true,
      },
      {
        waitBefore: 100,
        text: 'for reasons',
        user: 'testUser',
        isAssertion: true,
      }];
      sequence[0].messages = messages;
      const result = await controller.usersInput(sequence);
			
      reserveDialog = new ReserveDialog(bot, messages[0],robot, '<@testuser>', controller);
      const convo = reserveDialog.getConvo();
      const result = await convo.repromptDialog();
      await convo.script.time_thread[0].collect.options[0]
      console.log(result);
    });
  });
});
