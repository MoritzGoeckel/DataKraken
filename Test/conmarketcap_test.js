Coinmarketcap = require("../Retrieval/TimeseriesParser/Coinmarketcap.js");

Coinmarketcap.registerListener(function(market, name, data){
    console.log(market)
    console.log(name)
    console.log(data)
});