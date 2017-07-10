/**
 * Created by simhr on 09.07.17.
 */
const _str = require('underscore.string');

var count = 0;
module.exports = {
  // required properties
  nickname: 'SimonIRC',
  channel: '#support',

  // optional properties
  password: 'abcdef',
  onMessageAction: function(socket, nickname, nickaddress, command, cmdargs, message) {


    console.log('command=' + command);
    console.log('cmdargs=' + cmdargs);
    console.log('message=' + message);

    if(command === 'JOIN' && nickname !== 'SimonIRC') {
      // channel == message
      socket.write('PRIVMSG ' + message + ' :Hallo ' + nickname + '! Wilkommen im ' + message + '-Channel ;-)\r\n');
    }

    if(command === 'PRIVMSG') {
      var to = (cmdargs === 'SimonIRC') ? nickname : cmdargs;

      // new message in #support channel
      if(_str(message).startsWith('Hallo'))
        socket.write('PRIVMSG ' + to + ' :Hallo '+ nickname +' ;-)\r\n');

      if(_str(message).startsWith('Tschüss'))
        socket.write('PRIVMSG '+ to + ' :Tschüss '+ nickname +'!\r\n')
    }
  },

  onIntervalAction: function(socket) {
    //socket.write('PRIVMSG #support :' + (++count) + '. Nachricht!\r\n');
  }
};