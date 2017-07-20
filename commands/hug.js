/**
 * Created by simhr on 19.07.17.
 */
const path = require('path');
const fs = require('fs');
const _str = require('underscore.string');
const msg = require('../utility/messages');
const _ = require('lodash');

module.exports = {
  regex: /@hug\s*/i,
  cmdAction: function(irc, bot, sender, match) {
    var file = sender.toLowerCase() + '.txt';
    var filePath = path.join(irc.getConfig().botDirectory, 'simon', 'hug', file);

    var result = msg.updateFile(filePath, 1, function(filedata) {
      var num = parseInt(filedata);
      // do not change the old value
      if(_.isUndefined(num) || !_.isInteger(num))
        return;

      return num + 1;
    });

    if(result.success) {
      irc.write(bot.nickname + ' mag es von '+ _str.humanize(sender) + ' geknuddelt zu werden!');
      irc.write(_str.humanize(sender) + ' hat nun ' + result.newValue + (result.newValue === '1' ? ' Pluspunkt.' : ' Pluspunkte.'));
    }
  }
};