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
  var botLoader = new (require('./botLoader'))(config.botDirectory, config.hiddenChar);

  console.log('Loading all IRC bots...');
  if(!botLoader.init()) {
    console.log('Loading IRC bots failed.');
    return;
  }

  var cmdLoader = new (require('./cmdLoader'))(config.cmdDirectory, config.hiddenChar);
  console.log('Loading all IRC commands');
  if(!cmdLoader.init()) {
    console.log('Loading IRC commands failed.');
    return;
  }

  console.log('Initializing IRCBotServer');
  var ircBotServer = new (require('./ircBotServer'))(config, botLoader, cmdLoader);
  if(!ircBotServer.init()) {
    console.log('Initialization of IRCBotServer failed.');
    return;
  }

  ircBotServer.start();
  registerExitHandlers(ircBotServer);
})(require('./config'));