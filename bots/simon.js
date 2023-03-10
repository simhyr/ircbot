/**
 * Created by simhr on 13.07.17.
 */
//const _str = require('underscore.string');
//const fs = require('fs');
//const path = require('path');
//const msg = require('../../utility/messages');

var IRCBotBaseClass = require('./_base');
module.exports = class SimonIRCBot extends IRCBotBaseClass {
    constructor() {
        // command prefix
        super();

        this.nickname = 'simonIRCBot';
        this.channel = '#support';
        //this.channel = '#bottest';
      
        // optional properties
        // this.enableCmds = true;
        this.owner = 'simon';
    }

    onStartUpAction() {
        // once on startup
        this._onceHello = false;
        this._onceBye = false;
      }
      
      // before every new message
      onInitAction() {
        //this._byes = msg.readFileAsArray(path.join(__dirname, 'learn', 'byes.txt'));
        //this._hellos = msg.readFileAsArray(path.join(__dirname, 'learn', 'hellos.txt'));
      }
      
      onJoinAction(irc, sender, channel) {
        //irc.write('Hallo ' + _str.humanize(sender) + '! Wilkommen im ' + channel + '-Channel ;-)');
      }
      
      // left the channel or client exited
      onPartAction(irc, sender, message) {
        //if(sender !== this.owner)
          //irc.redirectTo('just left ' + this.channel, this.owner, sender);
      }
      
      onMessageAction(irc, sender, recipient, message) {
        // redirect all messages that i did not send to my nick
        /*if(sender !== this.owner)
          irc.redirectTo(message, this.owner, sender);
      
        // recipient may be a channel or own name
        var to = (recipient === this.nickname) ? sender : recipient;
        var time = new Date();
      
        if(time.getHours() <= 9 && time.getMinutes() <= 45 && msg.hasMatches(this._hellos, message))
          irc.write('Guten Morgen '+ _str.humanize(sender) +' ;-)', to);
      
        if (time.getHours() >= 16 && msg.hasMatches(this._byes, message))
          irc.write('Ciao und einen schönen Feierabend '+ _str.humanize(sender) +' :-)', to);*/
      }
      
      onIntervalAction(irc, channel, dateTime) {
        /*if(!this._onceHello && dateTime.getHours() <= 10) {
          irc.write('Guten Morgen zusammen :-)');
          this._onceHello = true;
        }
      
        if(!this._onceBye && dateTime.getHours() >= 16 && dateTime.getMinutes() >= 45) {
          var isFriday = (dateTime.getDay() === 5);
      
          var message = (isFriday) ? 'Ich wünsche euch allen einen schönen Feierabend und ein schönes Wochenende!'
            : 'Ich wünsche euch allen einen schönen Feierabend!';
      
          irc.write(message, channel);
          this._onceBye = true;
        }*/
      }
};