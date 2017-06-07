let request = require("request");

let downloadRatesInterval;
let downloadBtcMarketsInterval;

module.exports.registerListener = function (onData)
{
    let rates;
    function getRates(){
        request("http://api.fixer.io/latest?base=USD", function(err, res){
            
            if(err != null)
                console.log(err);

            rates = JSON.parse(res.body).rates;
        });
    }

    getRates();
    downloadRatesInterval = setInterval(getRates, 60 * 60 * 1000);

    downloadBtcMarketsInterval = setInterval(function(){
        if(rates != undefined){
            request("http://api.bitcoincharts.com/v1/markets.json", function(err, res){
                if(err != null)
                    console.log(err);

                let array = JSON.parse(res.body);

                for(let i in array)
                {
                    let obj = array[i];

                    if(obj.currency != 'USD')
                    {
                        obj.usdbid = (obj.bid / rates[obj.currency]);
                        obj.usdask = (obj.ask / rates[obj.currency]);
                    }
                    else
                    {
                        obj.usdbid = obj.bid;
                        obj.usdask = obj.ask;
                    }

                    obj.usdvolume = obj.volume * obj.usdask;
                    obj.btcvolume = obj.volume;
                    //obj.usdmedian = (obj.usdbid + obj.usdask) / 2;
                    obj.currencyask = obj.ask;
                    obj.currencybid = obj.bid;
                    obj.currencyavg = obj.avg;
                    obj.currencyvolume = obj.currency_volume;
                    
                    let name = obj.symbol;
                    delete obj.symbol;
                    delete obj.latest_trade;
                    delete obj.low;
                    delete obj.high;
                    delete obj.close;
                    delete obj.currency;
                    delete obj.low;
                    delete obj.bid;
                    delete obj.ask;
                    delete obj.avg;

                    if(obj.usdvolume > 1000 * 50 && Math.abs(obj.usdask - obj.usdbid) / obj.usdbid < 0.4)
                        onData("btcc", name, obj);
                }

                //possibleMarkets = possibleMarkets.sort(function(a,b) {return (a.usdmedian > b.usdmedian) ? 1 : ((b.usdmedian > a.usdmedian) ? -1 : 0);})
            });
        }
        else
            console.log("BTCCharts: Rates not defined yet!");
    }, 15 * 1000);
}

module.exports.stop = function(){
    clearInterval(downloadBtcMarketsInterval);
    clearInterval(downloadRatesInterval);
}