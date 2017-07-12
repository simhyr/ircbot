/**
 * Created by simhr on 12.07.17.
 */
module.exports = IRC;

function IRC(socket, bot){
  this._socket = socket;
  this._bot = bot;
}

IRC.prototype.write = function(message, recipient) {
  recipient = recipient || this._bot.channel;
  this._socket.write('PRIVMSG ' + recipient + ' :' + message + '\r\n');
};

IRC.prototype.redirectTo = function(message, recipient, sender) {
  message = (sender) ? sender + ': ' + message : message;
  this.write(message, recipient);
};