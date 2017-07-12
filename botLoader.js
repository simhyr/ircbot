/**
 * Created by simhr on 09.07.17.
 */
module.exports = RobotLoader;

const fs = require('fs');
const path = require('path');

function isValidBot(bot) {
  return bot.hasOwnProperty('nickname') && bot.hasOwnProperty('channel');
}

function RobotLoader(directory) {
  this._directory = directory;
  this._bots = [];
}

RobotLoader.prototype.init = function(){
  var self = this;

  var files = fs.readdirSync(self._directory, {encoding: 'utf8'});
  if(files.length === 0) {
    console.log('ERROR: No IRC bot located under \'' + self._directory + '\'.');
    return false;
  }

  files.forEach(function(file) {
    var filePath = path.join(__dirname, self._directory, file);
    console.log('Loading ' + filePath);
    self._bots.push(require(filePath));
  });

  self._bots = self._bots.filter(isValidBot);
  if(self._bots.length === 0) {
    console.log('ERROR: No valid IRC bot found.');
    return false;
  }

  return true;
};

RobotLoader.prototype.getBots = function() {
  return this._bots;
};

