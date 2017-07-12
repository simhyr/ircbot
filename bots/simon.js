/**
 * Created by simhr on 09.07.17.
 */
const _str = require('underscore.string');

var once = false;
module.exports = {
  // required properties
  nickname: 'SimonIRC',
  channel: '#support',

  // optional properties
  password: 'abcdef',

  onJoinAction: function(irc, nickname, channel) {
    irc.write('Hallo ' + nickname + '! Wilkommen im ' + channel + '-Channel ;-)');
  },

  onPartAction: function(irc, nickname, channel, message) {
    // nickname just left channel
  },

  // nickname = sender of message, recipient = receiver of message
  onMessageAction: function(irc, nickname, recipient, message) {
    // recipient may be a channel or own name
    var to = (recipient === 'SimonIRC') ? nickname : recipient;

    if(_str(message).startsWith('Hallo'))
      irc.write('Hallo '+ nickname +' ;-)', to);

    if(_str(message).startsWith('Tschüss'))
      irc.write('Tschüss '+ nickname +'!', to);
  },

  onIntervalAction: function(irc, channel, dateTime) {
    if(!once && dateTime.getHours() === 17) {
      var isFriday = (dateTime.getDay() === 5);

      var message = (isFriday) ? 'Simon wünscht euch allen einen schönen Feierabend und ein schönes Wochenende!'
        : 'Simon wünscht euch allen einen schönen Feierabend!';

      irc.write(message, channel);
      once = true;
    }
  }
};