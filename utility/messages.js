/**
 * Created by simhr on 12.07.17.
 */
const _str = require('underscore.string');

module.exports = {
  // returns true if the message contains one or more messages from array
  hasMatches: function(array, message) {
    if(!Array.isArray(array))
      return false;

    return array.some(function(entry, index, array) {
      return _str(message).toLowerCase().contains(entry);
    });
  }
};