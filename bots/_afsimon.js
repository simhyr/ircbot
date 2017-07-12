/**
 * Created by simhr on 09.07.17.
 */
const _str = require('underscore.string');
const msg = require('../utility/messages');

var onceBye = false;
var onceHello = false;

const byes = ['tschüss', 'ciao', 'schönen abend', 'guten abend', 'feierabend', 'bye'];
const hellos = ['hallo', 'guten morgen', 'schönen morgen', 'hi', 'hey'];

module.exports = {
  // required properties
  nickname: 'simonIRCbot',
  channel: '#support',

  onJoinAction: function(irc, nickname, channel) {
    irc.write('Hallo ' + _str.humanize(nickname) + '! Wilkommen im ' + channel + '-Channel ;-)');
  },

  onPartAction: function(irc, nickname, channel, message) {
    // nickname just left channel
  },

  // nickname = sender of message, recipient = receiver of message
  onMessageAction: function(irc, nickname, recipient, message) {
    // recipient may be a channel or own name
    var to = (recipient === 'SimonIRC') ? nickname : recipient;
    var time = new Date();

    if(time.getHours() <= 9 && time.getMinutes() <= 45 && msg.hasMatches(hellos, message))
      irc.write('Guten Morgen '+ _str.humanize(nickname) +' ;-)', to);

    if (time.getHours() >= 16 && msg.hasMatches(byes, message))
      irc.write('Ciao und einen schönen Feierabend '+ _str.humanize(nickname) +' :-)', to);
  },

  onIntervalAction: function(irc, channel, dateTime) {
    if(!onceHello && dateTime.getHours() < 9) {
      irc.write('Guten Morgen zusammen :-)');
      onceHello = true;
    }

    if(!onceBye && dateTime.getHours() > 17) {
      var isFriday = (dateTime.getDay() === 5);

      var message = (isFriday) ? 'Ich wünsche euch allen einen schönen Feierabend und ein schönes Wochenende!'
        : 'Ich wünsche euch allen einen schönen Feierabend!';

      irc.write(message, channel);
      onceBye = true;
    }
  }
};