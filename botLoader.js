/**
 * Created by simhr on 09.07.17.
 */
module.exports = BotLoader;

const fs = require('fs');
const path = require('path');
const _str = require('underscore.string');
const _ = require('lodash');

function isValidBot(bot) {
  return bot.hasOwnProperty('nickname') && bot.hasOwnProperty('channel');
}

function BotLoader(directory, hiddenChar) {
  this._directory = directory;
  this._hiddenChar = hiddenChar;
  this._bots = [];
}

BotLoader.prototype.init = function(){
  var self = this;

  if(!self._directory || !_.isString(self._directory)) {
    console.log('ERROR: Failed to load bot directory');
    return false;
  }

  var files = fs.readdirSync(self._directory, {encoding: 'utf8'}).filter(function(entry) {
    var stats = fs.statSync(path.join(__dirname, self._directory, entry));
    if(!self._hiddenChar)
      return stats.isFile();

    return !_str.startsWith(entry, self._hiddenChar) && stats.isFile();
  });

  if(files.length === 0) {
    console.log('ERROR: No IRC bot located under \'' + self._directory + '\'.');
    return false;
  }

  files.forEach(function(file) {
    var filePath = path.join(__dirname, self._directory, file);
    console.log('>> Loading ' + filePath);
    var bot = new (require(filePath));
    // bot constructor call
    if(isValidBot(bot)) {
      if(bot.hasOwnProperty('onStartUpAction'))
        bot.onStartUpAction();
      self._bots.push(bot);
    }
  });

  if(self._bots.length === 0) {
    console.log('ERROR: No valid IRC bot found.');
    return false;
  }

  return true;
};

BotLoader.prototype.getBots = function() {
  return this._bots;
};

