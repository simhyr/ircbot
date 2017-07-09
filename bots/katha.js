/**
 * Created by simhr on 09.07.17.
 */
/**
 * Created by simhr on 09.07.17.
 */
const _str = require('underscore.string');

module.exports = {
  // required properties
  nickname: 'KathaIRCbot',
  channel: '#support',

  // optional properties
  onMessageAction: function(socket, message) {
    var hello = _str.strRightBack(message, ':').trim();
    if(hello === 'Tschüss') {
      socket.write('PRIVMSG #support :Tschüss\r\n');
    }
  }
};