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

    return array.some(function(entry, index, array) {
      return _str(message).toLowerCase().contains(entry.toLowerCase());
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