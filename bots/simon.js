/**
 * Created by simhr on 09.07.17.
 */
const _str = require('underscore.string');

module.exports = {
  // required properties
  nickname: 'SimonIRCbot',
  channel: '#support',

  // optional properties
  password: 'abcdef',
  onMessageAction: function(socket, nickname, nickaddress, command, cmdargs, message) {
    if(command === 'PRIVMSG' && cmdargs === '#support') {
      // new message in #support channel
      if(_str(message).startsWith('Hallo'))
        socket.write('PRIVMSG #support :Hallo '+ nickname +' :-)\r\n');

      if(_str(message).startsWith('Tschüss'))
        socket.write('PRIVMSG #support :Tschüss '+ nickname +'!\r\n')
    }
  }
};