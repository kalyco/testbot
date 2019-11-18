'use strict';
const assert = require('assert');
const sinon = require('sinon');
const Convo = require('../indexController.js');
const {BotMock, SlackApiMock} = require('botkit-mock');
const {SlackAdapter, SlackMessageTypeMiddleware, SlackEventMiddleware} =
require('botbuilder-adapter-slack');
const axios = require('axios');

const axiosStubData = {
  data: {
    name: 'bernie',
    id: 'testId',
    site: {
      name: 'test271'
    },
    systemInfo: {
      network: {
        wlan0: [{
          address: '10.6.7.81'
        }],
        ztppiql5x5: [{
          address: '192.168.193.167'
        }]
      },
      swVersions: {
        mfp_cli: '1.58.1',
        mfp_config_client: '1.14.0',
        mfp_executive: '1.53.2',
        mfp_gui: '1.72.0',
        mfp_ros: '2.72.0',
        workflow_manager: '3.69.1'
      }

    }
  }
};

describe('Controller Tests', function () {
  // this.timeout(0);
  let stub;
  const user = 'user123';
  const channel = 'channel123';
  let botmock;
  const sequence = [
    {
      user,
      channel,
      messages: []
    }
  ];

  beforeEach(() => {
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

    // adapter.use(new SlackEventMiddleware());
    // adapter.use(new SlackMessageTypeMiddleware());

    botmock = new BotMock({
      adapter: adapter,
      disable_webserver: true,
    });
    SlackApiMock.bindMockApi(botmock);
    Convo(botmock);
    
    // this.retries(10);
    stub = sinon.stub(axios, 'get').returns(axiosStubData);
  });

  afterEach(() => {
    stub.restore();
    botmock.shutdown();
  });

  it('should return a stubbed axios "get" template', async () => {
    const result = await axios.get('');
    assert.strictEqual(result, axiosStubData);
  });

  context('Check Messages', function () {
    it('should return `Welcome Message` if a user types `hi`', async function () {
      const msg = {
        text: 'hi',
        isAssertion: true
      };
      sequence[0].messages.push(msg);
      const expected = 'Greetings, Professor.\nI am chuckbot and will walk you through adding or removing information to my reservation list.\nFor more information, please type help';
      const result = await botmock.usersInput(sequence);
      assert.strictEqual(result.text, expected);
    });

    it('should return `Help Menu` if user types `help`', async function () {
      const msg = {
        text: 'help',
        isAssertion: true
      };
      sequence[0].messages.push(msg);
      const expected = 'Chuckbot is a conversational Slack bot that will walk you through interacting with the reservation system\n' +
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
            '\ttransfer chuck: chuckbot will move a chuck to the other building in the list\n';
      const result = await botmock.usersInput(sequence);
      assert.strictEqual(result.text, expected);
    });

    context('Display Status Report', async function () {
      it('should show a personalized status for a bot', async function () {
        const msg = {
          text: 'bernie status',
          isAssertion: true
        };
        sequence[0].messages.push(msg);
        const expected = 'bernie info';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should show reservation status report', async function () {
        const msg = {
          text: 'status',
          isAssertion: true
        };
        sequence[0].messages.push(msg);
        const expected = '*Robots in 271*';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });
    });
  });

  describe('Handling Robots', function () {
    context('Add Robot to Fleet', function () {
      it('should reject robot name outside the regex spec', async function () {
        const msg = {
          text: 'add incorrect_name',
          isAssertion: true
        };
        sequence[0].messages.push(msg);
        const expected = 'You must enter a name that is 10 or less characters with no spaces';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should reject robot if name already exists', async function () {
        const msg = {
          text: 'add bernie',
          isAssertion: true
        };
        sequence[0].messages.push(msg);
        const expected = 'bernie already exists at 271';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should accept robot with correct name spec', async function () {
        const msg = {
          text: 'add somebotty',
          isAssertion: true
        };
        sequence[0].messages.push(msg);
        const expected = 'Which building is somebotty in?';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should reject incorrect building name', async function () {
        const messages = [
          {
            text: 'add somebotty'
          },
          {
            text: '277',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = 'Which building is somebotty in?';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });
    });

    context('Transfer Robot From Building', function () {
      it('should reject robot if name does not exist', async function () {
        const messages = [
          {
            text: 'transfer buzzo',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = '"buzzo" doesn\'t exist in the list';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should move robot if name exists', async function () {
        const messages = [
          {
            text: 'add buzz',
            waitAfter: 200,
          },
          {
            text: '271',
            waitBefore: 200,
          },
          {
            text: 'transfer buzz',
            isAssertion: true,
          },
          {
            text: 'remove buzz',
          }
        ];
        sequence[0].messages = messages;
        const expected = 'Moved buzz to 117';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });
    });

    /// ///////Things that will change
    context('Reserve Robot in Fleet', function () {
      it('should reject if robot name does not exist', async function () {
        const messages = [
          {
            text: 'reserve buzzo',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = '"buzzo" doesn\'t exist in the list';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should accept if robot name exists in list', async function () {
        const messages = [
          {
            text: 'add buzz',
            isAssertion: false
          },
          {
            text: '271',
            isAssertion: false
          },
          {
            text: 'reserve buzz',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, '<@user123>, give a ticket or reason for reservation\nEx. FS-1724 or Need bot for movement loops');
      });

      it('should reject a time of more than 48 hours', async function () {
        const messages = [
          {
            text: 'add buzz'
          },
          {
            text: '271'
          },
          {
            text: 'reserve buzz'
          },
          {
            text: 'reserving for unit test'
          },
          {
            text: '66',
            isAssertion: true
          },
          {
            text: 'remove buzz'
          }
        ];
        sequence[0].messages = messages;
        const expected = 'Sorry, you must type a whole number under 48';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should accept a time that is less than 48', async function () {
        const messages = [
          {
            text: 'add buzz'
          },
          {
            text: '271'
          },
          {
            text: 'reserve buzz'
          },
          {
            text: 'reserving for unit test'
          },
          {
            text: '1',
            isAssertion: true
          },
          {
            text: 'release buzz'
          },
          {
            text: 'remove buzz'
          }
        ];
        sequence[0].messages = messages;
        const expected = '<@user123> reserved buzz for 1 hours';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should reject if status is not open', async function () {
        const messages = [
          {
            text: 'add buzz'
          },
          {
            text: '271'
          },
          {
            text: 'reserve buzz'
          },
          {
            text: 'reserving for unit test'
          },
          {
            text: '1'
          },
          {
            text: 'reserve buzz',
            isAssertion: true
          },
          {
            text: 'release buzz'
          },
          {
            text: 'remove buzz'
          }
        ];
        sequence[0].messages = messages;
        const expected = 'buzz was already reserved by <@user123>';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should release robot after allotted time', async function () {
        const messages = [
          {
            text: 'reserve buzz'
          },
          {
            text: 'reserving for unit test'
          },
          {
            text: '25',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        this.clock = sinon.useFakeTimers();
        function start () {
          this.clock.tick(3600000);
        }
        const expected = '<@user123>, your reservation time has come to an end with buzz';
        const result = await botmock.usersInput(sequence);
        start();
        assert.strictEqual(result, expected);
        this.clock.restore();
      });
    });

    context('Release Robot From Reserve', function () {
      it('should reject if robot name does not exist', async function () {
        const messages = [
          {
            text: 'release buzzo',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = '"buzzo" doesn\'t exist in the list';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should reject if reserved by another user', async function () {
        const sequence = [
          {
            user: this.userInfo.slackId,
            channel: this.userInfo.channel,
            messages: [
              {
                text: 'add buzz'
              },
              {
                text: '271'
              },
              {
                text: 'reserve buzz'
              },
              {
                text: 'reserving for unit test'
              },
              {
                text: '1'
              }
            ]
          },
          {
            user: 'luser123',
            channel: this.userInfo.channel,
            messages: [
              {
                text: 'release buzz',
                isAssertion: true
              }
            ]
          },
          {
            user: this.userInfo.slackId,
            channel: this.userInfo.channel,
            messages: [
              {
                text: 'release buzz'
              },
              {
                text: 'remove buzz'
              }
            ]
          }
        ];
        const expected = 'You can not release a robot that you do not have reserved';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should accept if robot name is correct', async function () {
        const messages = [
          {
            text: 'add buzz'
          },
          {
            text: '271'
          },
          {
            text: 'reserve buzz'
          },
          {
            text: 'reserving for unit test'
          },
          {
            text: '1'
          },
          {
            text: 'release buzz',
            isAssertion: true
          },
          {
            text: 'remove buzz'
          }
        ];
        sequence[0].messages = messages;
        const expected = '<@user123> released buzz';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });
    });

    context('Remove Robot From Fleet', function () {
      it('should reject robot if name does not exist', async function () {
        const messages = [
          {
            text: 'remove buzzo',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = '"buzzo" doesn\'t exist in the list';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should remove robot with correct name', async function () {
        const messages = [
          {
            text: 'add buzz'
          },
          {
            text: '271'
          },
          {
            text: 'remove buzz',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = 'buzz has been removed from 271';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });
    });
  });

  describe('Handling Tools', function () {
    context('Add Tool', function () {
      it('should reject tool name outside the regex spec', async function () {
        const messages = [
          {
            text: 'add tool stupid_test_fixture_thingie',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = 'You must enter a name that is 25 or less characters with no spaces';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should reject tool if name already exists', async function () {
        const messages = [
          {
            text: 'remove thing'
          },
          {
            text: 'add tool thing'
          },
          {
            text: '271'
          },
          {
            text: 'add tool thing',
            isAssertion: true
          },
          {
            text: 'remove tool'
          }
        ];
        sequence[0].messages = messages;
        const expected = 'thing already exists at 271';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should accept tool with correct name spec', async function () {
        const messages = [
          {
            text: 'remove thing'
          },
          {
            text: 'add tool thing',
            isAssertion: true

          }
        ];
        sequence[0].messages = messages;
        const expected = 'Which building is thing in?';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should reject incorrect building name', async function () {
        const messages = [
          {
            text: 'add tool thing'

          },
          {
            text: '277',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = 'Which building is thing in?';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should accept building input with correct name', async function () {
        const messages = [
          {
            text: 'add tool thing'

          },
          {
            text: '271',
            isAssertion: true
          },
          {
            text: 'remove thing'
          }
        ];
        sequence[0].messages = messages;
        const expected = 'thing added to 271';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });
    });

    context('Transfer Tool', function () {
      it('should reject tool if name does not exist', async function () {
        const messages = [
          {
            text: 'transfer thingo',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = '"thingo" doesn\'t exist in the list';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should move tool if name exists', async function () {
        const messages = [
          {
            text: 'add tool thing'

          },
          {
            text: '271'
          },
          {
            text: 'transfer thing',
            isAssertion: true
          },
          {
            text: 'remove thing'
          }
        ];
        sequence[0].messages = messages;
        const expected = 'Moved thing to 117';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });
    });

    /// ///////Change it things that will change
    context('Reserve Tool', function () {
      it('should reject if tool name does not exist', async function () {
        const messages = [
          {
            text: 'remove thing'
          },
          {
            text: 'reserve thingo',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = '"thingo" doesn\'t exist in the list';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should accept if tool name exists in list', async function () {
        const messages = [
          {
            text: 'remove thing'
          },
          {
            text: 'add tool thing'
          },
          {
            text: '271'
          },
          {
            text: 'reserve thing',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = '<@user123>, give a ticket or reason for reservation\nEx. FS-1724 or Need bot for movement loops';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should reject a time of more than 48 hours', async function () {
        const messages = [
          {
            text: 'remove thing'
          },
          {
            text: 'add tool thing'
          },
          {
            text: '271'
          },
          {
            text: 'reserve thing'
          },
          {
            text: 'reserving for unit test'
          },
          {
            text: '66',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = 'Sorry, you must type a whole number under 48';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should accept a time that is less than 48', async function () {
        const messages = [
          {
            text: 'remove thing'
          },
          {
            text: 'add tool thing'
          },
          {
            text: '271'
          },
          {
            text: 'reserve thing'
          },
          {
            text: 'reserving for unit test'
          },
          {
            text: '1',
            isAssertion: true
          },
          {
            text: 'release thing'
          },
          {
            text: 'remove thing'
          }
        ];
        sequence[0].messages = messages;
        const expected = '<@user123> reserved thing for 1 hours';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should reject if status is not open', async function () {
        const messages = [
          {
            text: 'add tool thing'
          },
          {
            text: '271'
          },
          {
            text: 'reserve thing'
          },
          {
            text: 'reserving for unit test'
          },
          {
            text: '1'
          },
          {
            text: 'reserve thing',
            isAssertion: true
          },
          {
            text: 'release thing'
          },
          {
            text: 'remove thing'
          }
        ];
        sequence[0].messages = messages;
        const expected = 'thing was already reserved by <@user123>';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });
    });

    context('Remove Tool', function () {
      it('should reject tool if name does not exist', async function () {
        const messages = [
          {
            text: 'release thing'
          },
          {
            text: 'remove thing'
          },
          {
            text: 'remove thingo',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = '"thingo" doesn\'t exist in the list';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should remove tool with correct name', async function () {
        const messages = [
          {
            text: 'add tool thing'
          },
          {
            text: '271'
          },
          {
            text: 'remove thing',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = 'thing has been removed from 271';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });
    });

    context('Release Tool', function () {
      it('should reject if tool name does not exist', async function () {
        const messages = [
          {
            text: 'add tool thing'
          },
          {
            text: '271'
          },
          {
            text: 'reserve thing'
          },
          {
            text: 'reserving for unit test'
          },
          {
            text: '1'
          },
          {
            text: 'release thingo',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected = '"thingo" doesn\'t exist in the list';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });

      it('should accept if tool name is correct', async function () {
        const messages = [
          {
            text: 'add tool thing'
          },
          {
            text: '271'
          },
          {
            text: 'reserve thing'
          },
          {
            text: 'reserving for unit test'
          },
          {
            text: '1'
          },
          {
            text: 'release thing',
            isAssertion: true
          },
          {
            text: 'remove thing'
          }
        ];
        sequence[0].messages = messages;
        const expected = '<@user123> released thing';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, expected);
      });
    });

    context('Cleanup', function () {
      it('should erase leftover mock items', async function () {
        const messages = [
          {
            text: 'release thing'
          },
          {
            text: 'release buzz'
          },
          {
            text: 'remove buzz'
          },
          {
            text: 'remove thing',
            isAssertion: true
          }
        ];
        sequence[0].messages = messages;
        const expected1 = '"thing" doesn\'t exist in the list';
        const expected2 = 'thing has been removed from 271';
        const result = await botmock.usersInput(sequence);
        assert.strictEqual(result.text, (expected1 || expected2));
      });
    });
  });
});
