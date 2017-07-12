/**
 * Created by simhr on 09.07.17.
 */
const _str = require('underscore.string');
const msg = require('../utility/messages');

var onceBye = false;
var onceHello = false;

const redirectRecvNick = 'simon';
const byes = ['ciao', 'bye', 'nice day', 'good evening', 'cya', 'see you'];
const hellos = ['hello', 'good morning', 'hi', 'hey'];

module.exports = {
  // required properties
  nickname: 'simonIRCbot',
  channel: '#mychannel',

  // optional properties
  //password: 'abcdef',

  onJoinAction: function(irc, nickname, channel) {
    irc.write('Hello ' + _str.humanize(nickname) + '! Welcome to ' + channel + '-channel ;-)');
  },

  onPartAction: function(irc, nickname, channel, message) {
    // nickname just left channel
  },

  // nickname = sender of message, recipient = receiver of message
  onMessageAction: function(irc, nickname, recipient, message) {
    if(nickname !== redirectRecvNick)
      irc.redirectTo(message, redirectRecvNick, nickname);

    // recipient may be a channel or own name
    var to = (recipient === 'simonIRCbot') ? nickname : recipient;

    if(msg.hasMatches(hellos, message))
      irc.write('Hello '+ _str.humanize(nickname) +' ;-)', to);

    if (msg.hasMatches(byes, message))
      irc.write('Bye '+ _str.humanize(nickname) +'. Have a nice day :-)', to);
  },

  onIntervalAction: function(irc, channel, dateTime) {
    /*if(!onceHello && dateTime.getHours() < 9) {
      irc.write('Guten Morgen zusammen :-)');
      onceHello = true;
    }

    if(!onceBye && dateTime.getHours() > 17) {
      var isFriday = (dateTime.getDay() === 5);

      var message = (isFriday) ? 'Ich wünsche euch allen einen schönen Feierabend und ein schönes Wochenende!'
        : 'Ich wünsche euch allen einen schönen Feierabend!';

      irc.write(message, channel);
      onceBye = true;
    }*/
  }
};
