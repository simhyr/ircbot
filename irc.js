/**
 * Created by simhr on 12.07.17.
 */
module.exports = IRC;

function IRC(config, socket, bot){
  this._socket = socket;
  this._bot = bot;
  this._config = config;
}

IRC.prototype.getConfig = function() {
  return this._config;
};

IRC.prototype.write = function(message, recipient) {
  recipient = recipient || this._bot.channel;
  this._socket.write('PRIVMSG ' + recipient + ' :' + message + '\r\n');
};

IRC.prototype.getChannelMembers = function() {
	// TODO socket write and read
}

IRC.prototype.me = function(message) {
  // TODO
  var escape = String.fromCharCode(1);
  this.write(escape + 'ACTION ' + message + escape);
}

IRC.prototype.redirectTo = function(message, recipient, sender) {
  message = (sender) ? sender + ': ' + message : message;
  this.write(message, recipient);
};