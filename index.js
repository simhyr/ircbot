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
  var robotLoader = new (require('./robotLoader'))(config.robotDirectory);

  console.log('Loading all IRC bots...');
  if(!robotLoader.init()) {
    console.log('Loading IRC bots failed.');
    return;
  }

  var irc = new (require('./irc'))(config, robotLoader);
  irc.start();

  registerExitHandlers(irc);
})(require('./config'));