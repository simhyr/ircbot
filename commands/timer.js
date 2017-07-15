const _str = require('underscore.string');

module.exports = {
  regex: /!timer[ ](\d*)/i,
  cmdAction: function(irc, bot, sender, match) {
    var timeout = parseInt(match[match.length - 1]);
    if(!timeout || isNaN(timeout))
      return;

    setTimeout(function() {
      irc.write(_str.humanize(sender) + ', dein Timer ist abgelaufen!');
    }, timeout)
  }
};