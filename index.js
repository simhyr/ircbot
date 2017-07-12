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
  var botLoader = new (require('./botLoader'))(config.robotDirectory);

  console.log('Loading all IRC bots...');
  if(!botLoader.init()) {
    console.log('Loading IRC bots failed.');
    return;
  }

  var ircBotServer = new (require('./ircBotServer'))(config, botLoader);
  ircBotServer.start();

  registerExitHandlers(ircBotServer);
})(require('./config'));