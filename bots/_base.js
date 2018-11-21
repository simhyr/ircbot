var path = require('path');
var fs = require('fs');
var _str = require('underscore.string');

// TODO move
function lowerFirstLetter(className) {
    return className.charAt(0).toLowerCase() + className.slice(1);
}

function isValidCmd(cmd) {
    return cmd.hasOwnProperty('regex') && cmd.hasOwnProperty('cmdAction');
}

module.exports = class IRCBotBase {
    constructor() {
        this.commands = [];

        // load all commands
        this._initCommands();
    }

    _initCommands() {
        var botFileName = this.getCommandDirectoryName();
        console.log(`Loading IRC commands for ${botFileName}`);

        var botCmdPath = path.join('commands', botFileName);
        var files = fs.readdirSync(botCmdPath, {encoding: 'utf8'}).filter(entry => fs.statSync(path.join(botCmdPath, entry)).isFile() && !_str.startsWith(entry, '_'));

        files.forEach(file => {
            var filePath = path.join(__dirname, '..', botCmdPath, file);
            console.log('>> Loading ' + filePath);
            var cmd = require(filePath);
            if(isValidCmd(cmd))
                this.commands.push(cmd);
        });
    }

    _tryActivateCmd(irc, sender, message) {
        var activated = false;

        var self = this;
        this.commands.forEach(cmd => {
            var match = cmd.regex.exec(message);
            if(!match)
                return;
            
            cmd.cmdAction(irc, self, sender, match);
            activated = true;
        });

        return activated;
    }

    getCommandDirectoryName() {
        return lowerFirstLetter(this.constructor.name);
    }

    onBeforeMessageAction(irc, sender, recipient, message) {
        // execute commands
        if(this._tryActivateCmd(irc, sender, message)) return;

        if('onBeforeMessageAction' in this)
            this.onMessageAction(irc, sender, recipient, message);
    }

    onMessageAction(irc, sender, recipient, message) {
        console.log('base onMessageAction');
    }

    // on bot startup
    onStartUpAction() {}
      
    // before every new message
    onInitAction() {}
    
    // on join of channel
    onJoinAction(irc, sender, channel) {}
      
    // left the channel or client exited
    onPartAction(irc, sender, message) {}
      
    // on every new message
    onMessageAction(irc, sender, recipient, message) {}
      
    // on every interval
    onIntervalAction(irc, channel, dateTime) {}

};