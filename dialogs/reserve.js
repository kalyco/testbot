const moment = require('moment');
const {BotkitConversation} = require('botkit');
const jdata = require('../data/object.json');
const {writeData, setBotStatusOpen} = require('./helperFunctions');

module.exports = class ReserveDialog {
  constructor(bot, message, robot, userid, controller) {
    this.convo = new BotkitConversation('reserve (.*)', controller);
    this.regex = /\b([1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-8])\b/g;
    this.bot = bot;
    this.message = message;
    this.robot = robot;
    this.userid = userid;
    this.controller = controller;
    const botidx = jdata.findIndex(bot => bot.name === robot);
    const bsrch = jdata.filter(bot => bot.name === robot);
    this.jdataBot = jdata[botidx];
    if (!bsrch.length) {
      this.convo.say(`"${robot}" doesn't exist in the list`);
    } else {
      if (this.jdataBot.status === 'open') {
        this.askReasonForReservation();
        this.addConvoMessages();
        this.addConfirmQuestion();
        this.addQuantityQuestion();
      } else {
        this.convo.say(message, `${robot} was already reserved by ${jdata[botidx].resname}`);
      }
    } 
  }

  askReasonForReservation() {
    this.convo.addQuestion(
      `${this.userid}, give a ticket or reason for reservation\nEx. FS-1724 or Need bot for movement loops`,
      async (response) => {
        this.jdataBot.comment = response.text;
        writeData('../data/object,json', jdata);
        await this.convo.gotoThread('time_thread');
      }, {}, 'default');
  }
  
  askHowMuchTime() {
    this.convo.addQuestion(`${this.userid}, how many hours will you need for test? (Enter a whole number from 1-48)`, [
      {
        pattern: this.regex,
        handler: (response) => {
          const resTime = moment().format('MM/DD @HH:mm');
          const resHours = response.text;
          this.jdataBot.status = 'reserved';
          this.jdataBot.resname = this.userid;
          this.jdataBot.reslimit = resHours;
          this.jdataBot.restime = resTime;
          writeData('../data/object.json', jdata);
          this.setTimeoutAccordingToWeekend(resHours, resTime);
        }
      },
      {
        pattern: 'hold',
        handler: async () => {
          await this.convo.gotoThread('special_q');
        }
      },
      {
        default: true,
        handler: async () => {
          await this.convo.gotoThread('bad_response');
        }
      }
    ], {}, 'time_thread');
  }

  addConfirmQuestion() {
    this.convo.addQuestion('Are you sure?', [
      {
        pattern: 'yes',
        handler: async () => {
          const holdTime = moment().format('MMM Do @ HH:mm');
          this.jdataBot.status = 'hold';
          this.jdataBot.resname = this.userid;
          this.jdataBot.holdtime = holdTime;
          writeData('../data/object.json', jdata);
          await this.bot.reply(this.message, `${this.userid} has put a hold on ${this.robot} on ${holdTime}`);
          this.convo.say({
            text: `${this.userid} put ${this.robot} on hold for ${this.jdataBot.comment}`,
            channel: 'UBM663REW'
          });
        }
      },
      {
        pattern: 'no',
        handler: () => {
          this.convo.say('You have not reserved any robots');
        }
      },
      {
        default: true,
        handler: async (response, convo) => {
          await convo.gotoThread('bad_response2');
        }
      }
    ], {}, 'special_q');
  }

  getConvo() {
    return this.convo;
  }

  addConvoMessages() {
    this.convo.addMessage({
      text: 'Sorry, you must type a whole number under 48'
    }, 'bad_response');

    this.convo.addMessage({
      text: 'You must answer yes or no',
      action: 'special_q'
    }, 'bad_response2');
  }

  setTimeoutForRelease(resHours, moreThanDay) {
    const endSatTime = parseInt(resHours, 10) + 48;
    this.convo.say({
      text: `${this.userid} reserved ${this.robot} for ${resHours} hours\nYour reservation will be released on ${moment().add(endSatTime, 'hours').format('MM/DD @HH:mm')}`,
      channel: this.message.user
    });
    const resCount = endSatTime * 3600000;
    if (resHours < '24') {
      setTimeout(this.releaseBot, resHours, resCount);
    } else {
      setTimeout(moreThanDay, resCount);
      const nagTime = resCount - (resCount - 82800000);
      setTimeout(this.hourInterval, nagTime, resCount);
    }
  }

  hourInterval(resCount) {
    const nagTimer = setInterval(function () {
      const thisDay = moment().format('dddd');
      if ((this.jdataBot.status === 'reserved') && (this.jdataBot.restime === resCount) && (this.jdataBot.resname === this.userid)) {
        if ((thisDay !== 'Saturday') || (thisDay !== 'Sunday')) {
          this.convo.say({
            text: `${this.userid}, If you are no longer using ${this.robot}, please release`,
            channel: this.message.user
          });
        }
      } else {
      // console.log("No action on the weekend");
        console.log(`Stop nagging hooman about ${this.robot}`);
        clearInterval(nagTimer);
      }
    }, 3600000);
  }

  setTimeoutAccordingToWeekend(resHours, resCount) {
    const endDay = moment().add(resHours, 'hours').format('dddd');
    if (endDay === 'Saturday') {
      this.setTimeoutForRelease(resHours, '48');
    } else {
      const endTime = endDay === 'Sunday'
        ? parseInt(resHours, 10) + 24
        : parseInt(resHours, 10);
      resCount = endTime * 3600000;
      this.bot.say({
        text: `${this.userid} reserved ${this.robot} for ${this.resHours} hours\nYour reservation will be released on ${moment().add(endTime, 'hours').format('MM/DD @HH:mm')}`,
        channel: this.message.user
      });
      setTimeout(this.releaseBot, resCount);
      if (resHours >= '24') {
        const nagTime = resCount - (resCount - 82800000);
        setTimeout(this.hourInterval, nagTime,resCount);
      }
    }
  }

  releaseBot(resCount) {
    if ((this.jdataBot.restime === resCount) && (this.jdataBot.resname === this.userid)) {
      setBotStatusOpen(jdata, this.jdataBot);
      this.convo.say({
        text: `${this.userid}, your reservation time has come to an end with ${this.robot}`,
        channel: this.message.user,
      });
    }
  }  
};