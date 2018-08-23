const _str = require('underscore.string');
const _ = require('lodash');

function exec(strFnc, irc, sender) {
    let fnc = Function('irc', 'sender', strFnc);
    return fnc.call(null, irc, sender);
}

function tryExecFunction(strFnc, irc, sender) {
    try {
        let strFncReturn = `"use strict"; return ${strFnc}`;
        return exec(strFncReturn, irc, sender);
    } catch(error) {
        if(!error['name']) return;

        if(error.name == 'SyntaxError') {
            try {
                let strFncNoReturn = `"use strict"; ${strFnc}`;
                return exec(strFncNoReturn, irc, sender);
            } catch(errorNoReturn) {
                irc.write(errorNoReturn);
            }
        } else {
            irc.write(error);
        }
    }
}


module.exports = {
  regex: /@exec\s(.*)/i,
  cmdAction: function(irc, bot, sender, match) {
    // no valid function
    if(match.length < 2 || !match[1]) return;

    let result = tryExecFunction(match[1], irc, sender);
    if(_.isUndefined(result) || _.isObject(result)) return;

    irc.write(`${_str.humanize(sender)}, das Ergebnis ist ${result}.`);
  }
};