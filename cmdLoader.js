/**
 * Created by simhr on 15.07.17.
 */
const _str = require('underscore.string');
const fs = require('fs');
const path = require('path');

module.exports = CmdLoader;

function isValidCmd(cmd) {
  return cmd.hasOwnProperty('regex') && cmd.hasOwnProperty('cmdAction');
}

function CmdLoader(directory, hiddenChar) {
  this._directory = directory;
  this._hiddenChar = hiddenChar;
  this._cmds = [];
}

CmdLoader.prototype.init = function() {
  var self = this;

  if(!self._directory || !(typeof self._directory === 'string' || self._directory instanceof String)) {
    console.log('ERROR: Failed to load command directory');
    return false;
  }

  var files = fs.readdirSync(self._directory, {encoding: 'utf8'});
  if(self._hiddenChar)
    files = files.filter(function(entry){return !_str.startsWith(entry, self._hiddenChar)});

  files.forEach(function(file) {
    var filePath = path.join(__dirname, self._directory, file);
    console.log('Loading ' + filePath);
    var cmd = require(filePath);
    if(isValidCmd(cmd))
      self._cmds.push(cmd);
  });

  return true;
};

CmdLoader.prototype.tryActivateCmd = function(irc, bot, sender, message) {
  this._cmds.forEach(function(cmd) {
    var match = cmd.regex.exec(message);
    if(!match)
      return;

    cmd.cmdAction(irc, bot, sender, match);
  });
};