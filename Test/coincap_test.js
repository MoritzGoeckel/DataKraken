Coinmarketcap = require("../Retrieval/TimeseriesParser/CoinCap.js");

Coinmarketcap.registerListener(function(market, name, data){
    console.log(market)
    console.log(name)
    console.log(data)
});