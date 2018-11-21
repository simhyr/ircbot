module.exports = {
  regex: /@say[ ](.*)/i,
  cmdAction: function(irc, bot, sender, match) {
    irc.write(match.pop());
  }
};