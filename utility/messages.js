/**
 * Created by simhr on 12.07.17.
 */
const _str = require('underscore.string');
const path = require('path');
const fs = require('fs');

module.exports = {
  // returns true if the message contains one or more messages from array
  hasMatches: function(array, message) {
    if(!Array.isArray(array))
      return false;

    return array.some(function(entry, index, array) {
      return _str(message).toLowerCase().contains(entry.toLowerCase());
    });
  },

  readFileAsArray: function(filePath, separator) {
    separator = separator || '\n';
    return fs.readFileSync(filePath, 'utf-8').split(separator);
  }
};