const _str = require('underscore.string');
const path = require('path');
//const  player = require('play-sound')({player: path.join('sounds', 'mplayer.exe')});

module.exports = {
  regex: /@timer[ ](\d*)/i,
  cmdAction: function(irc, bot, sender, match) {
    var timeout = parseInt(match.pop());
    if(!timeout || isNaN(timeout))
      return;

    setTimeout(function() {
      irc.write(_str.humanize(sender) + ', dein Timer ist abgelaufen!');
	  //player.play(path.join('sounds', 'timer.mp3'), function(err) {
		//if(err) irc.write(err);
	  //});
    }, timeout);
  }
};