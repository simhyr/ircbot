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

  onJoinAction: function(socket, nickname, channel) {
    socket.write('PRIVMSG ' + channel + ' :Hallo ' + nickname + '! Wilkommen im ' + channel + '-Channel ;-)\r\n');
  },

  onPartAction: function(socket, nickname, channel, message) {
    // nickname just left channel
  },

  onMessageAction: function(socket, nickname, recipient, message) {
    // recipient may be a channel or own name
    var to = (recipient === 'SimonIRC') ? nickname : recipient;

    if(_str(message).startsWith('Hallo'))
      socket.write('PRIVMSG ' + to + ' :Hallo '+ nickname +' ;-)\r\n');

    if(_str(message).startsWith('Tschüss'))
      socket.write('PRIVMSG '+ to + ' :Tschüss '+ nickname +'!\r\n')
  },

  onIntervalAction: function(socket, channel, dateTime) {
    if(!once && dateTime.getHours() === 17) {
      var isFriday = (dateTime.getDay() === 5);

      var message = (isFriday) ? 'Simon wünscht euch allen einen schönen Feierabend und ein schönes Wochenende!'
        : 'Simon wünscht euch allen einen schönen Feierabend!';

      socket.write('PRIVMSG '+ channel + ' :' + message + '\r\n');
      once = true;
    }
  }
};