/**
 * Created by simhr on 09.07.17.
 */
const process = require('process');

function registerExitHandlers(irc) {
  var _stop = function() {
    irc.stop();
  };

  process.on('exit', _stop);
  process.on('SIGINT', _stop);
  process.on('uncaughtException', _stop);
}

(function(config) {
  var botLoader = new (require('./botLoader'))('bots', '_');

  console.log('Loading all IRC bots...');
  if(!botLoader.init()) {
    console.log('Loading IRC bots failed.');
    return;
  }

  console.log('Initializing IRCBotServer');
  var ircBotServer = new (require('./ircBotServer'))(config, botLoader);
  if(!ircBotServer.init()) {
    console.log('Initialization of IRCBotServer failed.');
    return;
  }

  ircBotServer.start();
  registerExitHandlers(ircBotServer);
})(require('./config'));