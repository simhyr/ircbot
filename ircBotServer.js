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

IRCBotServer.prototype._connect = function(bot) {
  var deferred = q.defer();
  var socket = net.createConnection({port: this.config.port, host: this.config.server});

  socket.on('connect', function() {
    deferred.resolve(socket);
  });

  socket.on('error', function(error) {
    console.log('ERROR ' + bot.nickname + ': ' + error.message);
    deferred.reject();
  });

  return deferred.promise;
};

IRCBotServer.prototype._pingFeedback = function(socket, message) {
  var ping = message.split('\r\n').filter(function(entry) {
    return _str(entry).startsWith('PING');
  });

  if(!ping || !Array.isArray(ping) || ping.length === 0)
    return;

  var check = _str.strRightBack(ping[0], ':');
  socket.write('PONG :' + check + '\r\n');
};

IRCBotServer.prototype._register = function(socket, bot) {
  var self = this;
  var deferred = q.defer();
  if(bot.hasOwnProperty('password'))
    socket.write('PASS ' + bot.password + '\r\n');

  socket.write('NICK ' + bot.nickname + '\r\n');
  socket.write('USER ' + bot.nickname + ' localhost ' + self.config.server + ' :'+self.nickname+'\r\n');

  var timeout = setTimeout(function() {
    deferred.reject();
  }, 10000);

  // welcome message on success
  var RPL_WELCOME = '001';
  socket.on('data', function(data) {
    var message = data.toString();
    self._pingFeedback(socket, message);

    if(_str(message).contains(RPL_WELCOME)) {
      clearTimeout(timeout);
      deferred.resolve();
    }
  });

  return deferred.promise;
};

IRCBotServer.prototype._join = function(socket, bot) {
  var deferred = q.defer();
  socket.write('JOIN ' + bot.channel + '\r\n');

  var timeout = setTimeout(function() {
    deferred.reject();
  }, 10000);

  socket.on('data', function(data) {
    var message = data.toString();

    if(_str(message).contains(bot.nickname + ' = ' + bot.channel + ' ')) {
      clearTimeout(timeout);
      deferred.resolve();
    }
  });

  return deferred.promise;
};

IRCBotServer.prototype.start = function() {
  var self = this;

  console.log('Connecting all IRC bots');
  self.botLoader.getBots().forEach(function(bot) {
    console.log(bot.nickname + ' connecting to ' + self.config.server + ':' + self.config.port);
    self._connect(bot).then(function(socket) {
      console.log(bot.nickname + ' connected');
      self._sockets.push(socket);
      self._afterConnectAction(socket, bot);
    }, function() {
      console.log('Connection failed.');
    });
  });
};

IRCBotServer.prototype._afterConnectAction = function(socket, bot) {
  var self = this;

  console.log('Register ' + bot.nickname);
  this._register(socket, bot).then(function() {
    console.log('Registration completed.');
    console.log(bot.nickname + ' is trying to join ' + bot.channel);
    return self._join(socket, bot);
  }).then(function () {
    console.log(bot.nickname + ' joined ' + bot.channel);

    socket.on('data', function (data) {
      var msgInfo = parseIRCMessage(data.toString());
      if(!msgInfo)
        return;

      // other nick has joined the channel
      if(msgInfo.command === 'JOIN' && msgInfo.nickname !== bot.nickname && bot.hasOwnProperty('onJoinAction'))
        bot.onJoinAction(new IRC(socket, bot), msgInfo.nickname, msgInfo.message);

      // other nick has left the channel
      // case part: channel is set as cmdargs
      // case quit: no channel is set
      if((msgInfo.command === 'PART' || msgInfo.command === 'QUIT') && msgInfo.nickname !== bot.nickname && bot.hasOwnProperty('onPartAction'))
        bot.onPartAction(new IRC(socket, bot), msgInfo.nickname, msgInfo.message);

      // a message was received (either in channel or as private message)
      if (msgInfo.command === 'PRIVMSG' && bot.hasOwnProperty('onMessageAction'))
        bot.onMessageAction(new IRC(socket, bot), msgInfo.nickname, msgInfo.cmdargs, msgInfo.message);
    });

    // interval action
    self._intervals.push(setInterval(function() {
      if(bot.hasOwnProperty('onIntervalAction'))
        bot.onIntervalAction(new IRC(socket, bot), bot.channel, new Date());
    }, self.config.interval));
  }, function(socket) {
    console.log(bot.nickname + ' failed to join ' + bot.channel);
    socket.end();
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
