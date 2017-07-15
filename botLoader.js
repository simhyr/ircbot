/**
 * Created by simhr on 09.07.17.
 */
module.exports = BotLoader;

const fs = require('fs');
const path = require('path');
const _str = require('underscore.string');

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

  if(!self._directory || !(typeof self._directory === 'string' || self._directory instanceof String)) {
    console.log('ERROR: Failed to load bot directory');
    return false;
  }

  var files = fs.readdirSync(self._directory, {encoding: 'utf8'});
  if(self._hiddenChar)
    files = files.filter(function(entry){return !_str.startsWith(entry, self._hiddenChar)});

  if(files.length === 0) {
    console.log('ERROR: No IRC bot located under \'' + self._directory + '\'.');
    return false;
  }

  files.forEach(function(file) {
    var filePath = path.join(__dirname, self._directory, file);
    console.log('Loading ' + filePath);
    var bot = new (require(filePath));
    // bot constructor call
    if(isValidBot(bot))
      self._bots.push(bot);
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

