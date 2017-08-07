/**
 * Created by simhr on 12.07.17.
 */
const _str = require('underscore.string');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');

module.exports = {
  // returns true if the message contains one or more messages from array
  hasMatches: function(array, message) {
    if(!Array.isArray(array))
      return false;

    var regex = /([^\w\d\sßäöü])/gi;
    message = message.replace(regex, ' ');

    var msgSplit = message.split(' '); // [Hallo, wünsche, guten, morgen, zusammen]
    return array.some(function(entry) {
      var entrySplit = entry.split(' '); // [Guten, Morgen]

      var lastIndex = null;
      var result = true;
      entrySplit.forEach(function(word) {
        var curIdx = _.findIndex(msgSplit, function(e) {
          return e.toLowerCase() === word.toLowerCase();
        });

        // word not found in message
        if(curIdx < 0) {
          result = false;
          return;
        }

        // setup lastIndex in first iteration
        if(!lastIndex) {
          lastIndex = curIdx;
          return;
        }

        // there must not be any word in between two or more matches
        if(curIdx !== lastIndex + 1) {
          result = false;
          return;
        }
      });

      return result;
    });
  },

  readFileAsArray: function(filePath, separator) {
    separator = separator || '\n';
    return fs.readFileSync(filePath, {encoding: 'utf8'}).split(separator);
  },

  updateFile: function(filePath, initValue, updateAction) {
    if(!_.isString(initValue))
      initValue = initValue.toString();

    if(!_.isString(filePath) || !_.isFunction(updateAction))
      return {
        success: false
      };

    var currentValue = initValue;
    if(fs.existsSync(filePath)) {
      var oldValue = fs.readFileSync(filePath, {encoding: 'utf8'});
      var newValue = updateAction(oldValue);
      if(_.isUndefined(newValue)) {
        currentValue = oldValue;
      } else {
        currentValue = (!_.isString(newValue)) ? newValue.toString() : newValue;
      }
    }

    fs.writeFileSync(filePath, currentValue, {encoding: 'utf8'});
    return {
      success: currentValue !== oldValue,
      newValue: currentValue,
      oldValue: oldValue
    };
  }
};