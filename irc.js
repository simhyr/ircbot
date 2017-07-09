/**
 * Created by simhr on 09.07.17.
 */
module.exports = IRC;

const _str = require('underscore.string');
const net = require('net');
const q = require('q');

function IRC(config, robotLoader) {
  this.robotLoader = robotLoader;
  this.config = config;
  this._sockets = [];
}

IRC.prototype.stop = function() {
  this._sockets.forEach(function(socket) {
    socket.end();
  });
};

IRC.prototype._connect = function(bot) {
  var socket = net.Socket();
  socket.connect(this.config.port, this.config.server);
  return socket;
};

IRC.prototype._register = function(socket, bot) {
  var self = this;
  var deferred = q.defer();
  // register bot
  if(bot.hasOwnProperty('password'))
    socket.write('PASS ' + bot.passwyord + '\r\n');

  socket.write('NICK ' + bot.nickname + '\r\n');
  socket.write('USER ' + bot.nickname + ' localhost ' + self.config.server + ' :'+self.nickname+'\r\n');

  socket.on('data', function(data) {
    var message = data.toString();
    // register ping handler
    if (_str.contains(message, 'PING')) {
      var check = _str.strRightBack(message, ':');
      var pong = 'PONG :' + check + '\r\n';
      socket.write(pong);

      // join channel after first pong
      if(!bot.joined) {
        self._join(socket, bot);
        deferred.resolve();
      }
    }
  });

  return deferred.promise;
};

IRC.prototype._join = function(socket, bot) {
  var join = 'JOIN ' + bot.channel + '\r\n';
  socket.write(join);
  bot.joined = true;
};

IRC.prototype.start = function() {
  var self = this;

  // one socket per bot
  console.log('Connecting all IRC bots');
  self.robotLoader.getBots().forEach(function(bot) {
    console.log(bot.nickname + ' connecting to ' + self.config.server + ':' + self.config.port);
    var socket = self._connect(bot);
    console.log(bot.nickname + ' connected');
    self._sockets.push(socket);

    console.log('Setup ' + bot.nickname);
    var registration = self._register(socket, bot);
    registration.then(function() {
      console.log('Setup ' + bot.nickname + ' completed');
      socket.on('data', function(data){
        // TODO parse message into nick, time, message
        var message = data.toString();
        if(bot.hasOwnProperty('onMessageAction'))
          bot.onMessageAction(socket, message);
      });
    });

    socket.on('error', function(err) {
      console.log(err);
    });
  });
};