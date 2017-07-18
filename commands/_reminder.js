const _str = require('underscore.string');

module.exports = {
  regex: /@reminder[ ](\d*)[ ](\d*)/i,
  cmdAction: function(irc, bot, sender, match) {
    var intervalCnt = parseInt(match.pop());
    var intervalTime = parseInt(match.pop());

    if(!intervalCnt|| isNaN(intervalCnt) || !intervalTime || isNaN(intervalTime))
      return;

    var cnt = 0;
    var interval = setInterval(function() {
      irc.write(_str.humanize(sender) + ', du wirst erinnert!');
      if(++cnt === intervalCnt)
        clearInterval(interval);
    }, intervalTime);
  }
};