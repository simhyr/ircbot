/**
 * Created by simhr on 09.07.17.
 */
module.exports = IRCBotServer;

const _str = require('underscore.string');
const net = require('net');
const q = require('q');
const IRC = require('./irc');

function IRCBotServer(config, botLoader) {
  this.botLoader = botLoader;
  this.config = config;
  this._sockets = [];
  this._intervals = [];
}

IRCBotServer.prototype.stop = function() {
  this._intervals.forEach(function(interval) {
    clearInterval(interval);
  });

  this._sockets.forEach(function(socket) {
    socket.end('QUIT\r\n');
  });
};

IRCBotServer.prototype._connect = function(bot) {
  var socket = net.Socket();

  socket.on('error', function(error) {
    console.log('ERROR ' + bot.nickname + ': ' + error.message);
  });

  return socket.connect(this.config.port, this.config.server);
};

IRCBotServer.prototype._register = function(socket, bot) {
  var self = this;
  var deferred = q.defer();
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

IRCBotServer.prototype._join = function(socket, bot) {
  socket.write('JOIN ' + bot.channel + '\r\n');
  bot.joined = true;
};

IRCBotServer.prototype.start = function() {
  var self = this;

  // one socket per bot
  console.log('Connecting all IRC bots');
  self.botLoader.getBots().forEach(function(bot) {
    console.log(bot.nickname + ' connecting to ' + self.config.server + ':' + self.config.port);
    var socket = self._connect(bot);
    // TODO check if connection could be established
    console.log(bot.nickname + ' connected');
    self._sockets.push(socket);

    console.log('Setup ' + bot.nickname);
    var registration = self._register(socket, bot);
    registration.then(function () {
      console.log('Setup ' + bot.nickname + ' completed');
      socket.on('data', function (data) {
        var msgInfo = parseIRCMessage(data.toString());

        if(!msgInfo)
          return;

        if(msgInfo.command === 'JOIN' && msgInfo.nickname !== bot.nickname && bot.hasOwnProperty('onJoinAction'))
          bot.onJoinAction(new IRC(socket, bot), msgInfo.nickname, msgInfo.message);

        if(msgInfo.command === 'PART' && msgInfo.nickname !== bot.nickname && bot.hasOwnProperty('onPartAction'))
          bot.onPartAction(new IRC(socket, bot), msgInfo.nickname, msgInfo.cmdargs, msgInfo.message);

        if (msgInfo.command === 'PRIVMSG' && bot.hasOwnProperty('onMessageAction'))
          bot.onMessageAction(new IRC(socket, bot), msgInfo.nickname, msgInfo.cmdargs, msgInfo.message);
      });

      self._intervals.push(setInterval(function() {
        if(bot.hasOwnProperty('onIntervalAction'))
          bot.onIntervalAction(new IRC(socket, bot), bot.channel, new Date());
      }, self.config.interval));
    });
  });
};

function parseIRCMessage(message) {
  message = _str.trim(message);
  // :<botname>!<botname@botaddress> <command> <parameterlist>:<message>
  //(?:) => does not form a capture group to not include \n into group
  const regex = /:(.+)!(\S*)[ ]([a-z]+)[ ](?:(\S+)[ ]){0,1}:(.*)/ig;
  var match = regex.exec(message);
  if(!match || match.length !== 6)
    return;

  return {
    nickname: match[1],
    nickaddress: match[2],
    command: match[3],
    cmdargs: match[4],
    message: match[5]
  };
}