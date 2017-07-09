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
  onMessageAction: function(socket, message) {
    var hello = _str.strRightBack(message, ':').trim();
    //console.log('BOT GET MEssage=' + hello);
    if(hello === 'Hallo') {
      //console.log('answering!');
      socket.write('PRIVMSG #support :Hallo\r\n');
    }
  }
};