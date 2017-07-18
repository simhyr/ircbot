/**
 * Created by simhr on 13.07.17.
 */
const _str = require('underscore.string');
const fs = require('fs');
const path = require('path');
const msg = require('../../utility/messages');

module.exports = AfSimon;

function AfSimon() {
  this.nickname = 'simonIRCBot';
  this.channel = '#support';

  // optional properties
  this.enableCmds = true;
  this.owner = 'simon';
  this.onJoinAction = onJoinAction;
  this.onPartAction = onPartAction;
  this.onMessageAction = onMessageAction;
  this.onIntervalAction = onIntervalAction;

  // custom initialization
  this._onceHello = false;
  this._onceBye = false;

  this._byes = msg.readFileAsArray(path.join(__dirname, 'byes.txt'));
  this._hellos = msg.readFileAsArray(path.join(__dirname, 'hellos.txt'));
}

function onJoinAction(irc, sender, channel) {
  irc.write('Hallo ' + _str.humanize(sender) + '! Wilkommen im ' + channel + '-Channel ;-)');
}

// left the channel or client exited
function onPartAction(irc, sender, message) {
  //if(sender !== this.owner)
    //irc.redirectTo('just left ' + this.channel, this.owner, sender);
}

function onMessageAction(irc, sender, recipient, message) {
  if(_str(message).startsWith('@'))
    return;

  // redirect all messages that i did not send to my nick
  if(sender !== this.owner)
    irc.redirectTo(message, this.owner, sender);

  // recipient may be a channel or own name
  var to = (recipient === this.nickname) ? sender : recipient;
  var time = new Date();

  if(time.getHours() <= 9 && time.getMinutes() <= 45 && msg.hasMatches(this._hellos, message))
    irc.write('Guten Morgen '+ _str.humanize(sender) +' ;-)', to);

  if (time.getHours() >= 16 && msg.hasMatches(this._byes, message))
    irc.write('Ciao und einen schönen Feierabend '+ _str.humanize(sender) +' :-)', to);
}

function onIntervalAction(irc, channel, dateTime) {
  if(!this._onceHello && dateTime.getHours() < 9) {
    irc.write('Guten Morgen zusammen :-)');
    this._onceHello = true;
  }

  if(!this._onceBye && dateTime.getHours() > 17) {
    var isFriday = (dateTime.getDay() === 5);

    var message = (isFriday) ? 'Ich wünsche euch allen einen schönen Feierabend und ein schönes Wochenende!'
      : 'Ich wünsche euch allen einen schönen Feierabend!';

    irc.write(message, channel);
    this._onceBye = true;
  }
}