Coinmarketcap = require("../Retrieval/TimeseriesParser/CoinCapHTTP.js"); //Coinmarketcap

Coinmarketcap.registerListener(function(market, name, data){
    console.log(market)
    console.log(name)
    console.log(data)
});