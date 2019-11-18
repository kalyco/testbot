const express = require('express');
const request = require('request');
const Botkit = require('botkit');
require('dotenv').config();
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

/// /////////////////////////////////////////////////////
// Starts express and serves bot through ngrok to slack
var app = express();
const PORT = 4390;

app.listen(PORT, function () {
  console.log('chuckbot2 listening on port ' + PORT);
});

app.get('/', function (req, res) {
  res.send('Ngrok has comm for path "' + req.url + '"');
});

app.get('/oauth', function (req, res) {
  if (!req.query.code) {
    res.status(500);
    res.send({Error: "Looks like we're not getting code."});
    console.log("Looks like we're not getting code.");
  } else {
    request({
      url: 'https://slack.com/api/oauth.access',
      qs: {code: req.query.code, client_id: clientId, client_secret: clientSecret},
      method: 'GET'
    }, function (error, response, body) {
      if (error) {
        console.log(error);
      } else {
        res.json(body);
      }
    });
  }
});

app.post('/command', function (req, res) {
  res.send('ngrok tunnel is functional');
});

/// ////////////////////
// botkit with rtm api
const controller = Botkit.slackbot({
  debug: false,
  stats_optout: true
});
require('./indexController.js')(controller, setTimeout);

controller.spawn({
  token: process.env.BOT_TOKEN,
  retry: 'Infinity'
}).startRTM();
