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
  this._retryJoinMax = 15;
}

IRCBotServer.prototype.init = function() {
  if(!this.config) {
    console.log('ERROR: Failed to load config file');
    return false;
  }

  if(!this.config.hasOwnProperty('server') || !(typeof this.config.server === 'string' || this.config.server instanceof String)) {
    console.log('ERROR: Failed to load config.server');
    return false;
  }

  if(!this.config.hasOwnProperty('port') || !(typeof this.config.port === 'number' || this.config.port instanceof Number)) {
    console.log('ERROR: Failed to load config.port');
    return false;
  }

  if(!this.config.hasOwnProperty('interval') || !(typeof this.config.interval === 'number' || this.config.interval instanceof  Number)) {
    console.log('ERROR: Failed to load config.interval');
    return false;
  }

  return true;
};

IRCBotServer.prototype.stop = function() {
  this._intervals.forEach(function(interval) {
    clearInterval(interval);
  });

  this._sockets.forEach(function(socket) {
    socket.end('QUIT\r\n');
  });
};

IRCBotServer.prototype._connect = function(bot, onConnectAction) {
  var socket = net.createConnection({port: this.config.port, host: this.config.server}, onConnectAction);

  socket.on('error', function(error) {
    console.log('ERROR ' + bot.nickname + ': ' + error.message);
  });

  return socket;
};

IRCBotServer.prototype._runPingHandler = function(socket, message) {
  if (_str.startsWith(message, 'PING')) {
    var check = _str.strRightBack(message, ':');
    socket.write('PONG :' + check + '\r\n');
  }
};

IRCBotServer.prototype._register = function(socket, bot) {
  var self = this;
  var deferred = q.defer();
  if(bot.hasOwnProperty('password'))
    socket.write('PASS ' + bot.password + '\r\n');

  socket.write('NICK ' + bot.nickname + '\r\n');
  socket.write('USER ' + bot.nickname + ' localhost ' + self.config.server + ' :'+self.nickname+'\r\n');

  var tryJoin = setInterval(function() {
    self._join(socket, bot);
    bot.retryJoinCnt = !bot.retryJoinCnt ? 1 : bot.retryJoinCnt + 1;
  }, 2000);

  // to be sure that it gets killed on application stop
  self._intervals.push(tryJoin);

  socket.on('data', function(data) {
    var message = data.toString();
    // register ping/pong handler
    self._runPingHandler(socket, message);
    if(!bot.joined && _str(message).contains(bot.nickname + ' = ' + bot.channel + ' ')) {
      console.log(bot.nickname + ' joined ' + bot.channel);
      bot.joined = true;
      clearInterval(tryJoin);
      deferred.resolve();
    }

    if(bot.retryJoinCnt >= self._retryJoinMax && !bot.joined) {
      clearInterval(tryJoin);
      deferred.reject(socket);
    }
  });

  return deferred.promise;
};

IRCBotServer.prototype._join = function(socket, bot) {
  socket.write('JOIN ' + bot.channel + '\r\n');
};

IRCBotServer.prototype.start = function() {
  var self = this;

  // one socket per bot
  console.log('Connecting all IRC bots');
  self.botLoader.getBots().forEach(function(bot) {
    console.log(bot.nickname + ' connecting to ' + self.config.server + ':' + self.config.port);
    var socket = self._connect(bot, function() {
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

          // other nick has joined the channel
          if(msgInfo.command === 'JOIN' && msgInfo.nickname !== bot.nickname && bot.hasOwnProperty('onJoinAction'))
            bot.onJoinAction(new IRC(socket, bot), msgInfo.nickname, msgInfo.message);

          // other nick has left the channel
          if(msgInfo.command === 'PART' && msgInfo.nickname !== bot.nickname && bot.hasOwnProperty('onPartAction'))
            bot.onPartAction(new IRC(socket, bot), msgInfo.nickname, msgInfo.cmdargs, msgInfo.message);

          // a message was received (either in channel or as private message)
          if (msgInfo.command === 'PRIVMSG' && bot.hasOwnProperty('onMessageAction'))
            bot.onMessageAction(new IRC(socket, bot), msgInfo.nickname, msgInfo.cmdargs, msgInfo.message);
        });

        self._intervals.push(setInterval(function() {
          if(bot.hasOwnProperty('onIntervalAction'))
            bot.onIntervalAction(new IRC(socket, bot), bot.channel, new Date());
        }, self.config.interval));
      }, function(socket) {
        console.log(bot.nickname + ' failed to join ' + bot.channel);
        socket.end();
      });
    });
  });
};

function parseIRCMessage(message) {
  message = _str.trim(message);
  // :<botname>!<botname@botaddress> <command> <parameterlist>:<message>
  //(?:) => does not form a capture group to not include ' ' into group
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