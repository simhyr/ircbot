const os = require('os');
const _ = require('lodash');

function getIPv4Addresses(){
    var ifaces = os.networkInterfaces();
    if(!ifaces) return;

    var ifaceName2Ipv4 = [];
    for(var iface in ifaces) {
        if(!ifaces.hasOwnProperty(iface)) return;


        var array = _.values(ifaces[iface]);
        var interfaceIps = _.filter(array, e => !e.internal && e.family == 'IPv4');
        if(!interfaceIps || interfaceIps.length == 0) continue;

        ifaceName2Ipv4.push({
            name: iface,
            addresses: interfaceIps
        });
    }

    return ifaceName2Ipv4;
}

function ipv4ToString(ifaceName2Ipv4) {
    if(!ifaceName2Ipv4 || ifaceName2Ipv4.length == 0) return;

    var _isLastIteration = (index, length) => index == length - 1;

    // <name> : <ip_address>[,<ip_address2>];
    var str = '';
    for(var i = 0; i < ifaceName2Ipv4.length; i++) {
        var currentIface = ifaceName2Ipv4[i];
        if(!currentIface.addresses || currentIface.addresses.length == 0) return;

        str += `${currentIface.name}: `;
        for(var y = 0; y < currentIface.addresses.length; y++) {
            str += currentIface.addresses[y].address;
            // not last iteration
            if(!_isLastIteration(y, currentIface.addresses.length))
                str += ', ';
        }

        if(!_isLastIteration(i, ifaceName2Ipv4.length))
            str += '; ';
    }

    return str;
}

module.exports = {
  regex: /@ip/i,
  cmdAction: function(irc, bot, sender, match) {
    irc.write(ipv4ToString(getIPv4Addresses()));
  }
};