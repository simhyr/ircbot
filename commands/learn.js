/**
 * Created by simhr on 18.07.17.
 */
const fs = require('fs');
const path = require('path');
const _str = require('underscore.string');
const msg = require('../utility/messages');

module.exports = {
  regex: /@learn[ ](byes|hellos)(?:.txt){0,1}[ ](.*)/i,
  cmdAction: function(irc, bot, sender, match) {
    if(match.length !== 3)
      return;

    if(!bot.hasOwnProperty('owner') || bot.owner.toLowerCase() !== sender.toLowerCase()) {
      irc.write(_str(sender).humanize().value() + ', leider bist du nicht berechtigt mir etwas beizubringen.');
      return;
    }

    var config = irc.getConfig();
    var sentence = _str(match.pop()).trim().toLowerCase().value();
    var file = match.pop() + '.txt';
    var filePath = path.join(config.botDirectory, sender, file);
    if(!fs.existsSync(filePath)) {
      console.log(filePath + ' existiert nicht!');
      return;
    }

    var fileArray = msg.readFileAsArray(filePath);
    var alreadyKnowing = fileArray.some(function(entry) {
      return _str(entry.toLowerCase()).trim().value() === sentence;
    });

    if(!alreadyKnowing) {
      fs.appendFileSync(filePath,(fileArray.length > 0) ? '\n' + sentence : sentence, 'utf8');
      irc.write('Danke, ich habe wieder etwas Neues gelernt. Die Datei ' + filePath + ' wurde aktualisiert!');
    } else {
      irc.write('\'' + _str.humanize(sentence) + '\' kenne ich bereits.');
    }
  }
};