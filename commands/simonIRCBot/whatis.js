const _ = require('lodash');
const _str = require('underscore.string');
let wikidataClass = require('./wikidata/wikidata');

module.exports = {
  regex: /@whatis[ ](.*)/i,
  cmdAction: function(irc, bot, sender, match) {
    let searchQuery = match.pop();
    let wikidata = new wikidataClass('de', 'json');

    wikidata.getAsync(searchQuery, data => {
        let json = JSON.parse(data);
        if(!json || !json.search || !Array.isArray(json.search) || json.search.length == 0) {
            irc.write(`${_str.humanize(sender)}, für "${json.searchinfo.search}" gibt es keine Suchergebnisse.`);
            return;
        }

        let search = _.uniqBy(json.search, (e) => e.id);
        let result = '';
        result += `${_str.humanize(sender)}, deine Suchergebnisse für "${json.searchinfo.search}" sind: `;
        var mapping = search.map(function(e) {
            return {
                text: (!e.description) ? e.label : e.description,
                url: e.url.substr(2)
            };
        });
    
        for(let i = 0; i < mapping.length; i++) {
            let entry = mapping[i];
            result += `${i + 1}. ${entry.text} (${entry.url}) `;
        }

        irc.write(result);
    });
  }
};