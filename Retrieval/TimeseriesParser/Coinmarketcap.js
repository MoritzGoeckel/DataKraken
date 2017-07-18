const request = require("request");

let downloadDataInterval;

module.exports.registerListener = function (onData)
{
    function getData(){
        request("https://api.coinmarketcap.com/v1/ticker/?convert=USD", function(err, res){
            
            if(err != null)
                console.log(err);
            
            resp = JSON.parse(res.body)

            for(let r in resp){
                let output = {};
                let id = resp[r].id;
                output.usd = parseFloat(resp[r].price_usd);
                output.btc = parseFloat(resp[r].price_btc);
                output.volume = parseFloat(resp[r]['24h_volume_usd']);
                output.cap = parseFloat(resp[r].market_cap_usd);

                onData("cmc", id, output);
            }
        });
    }

    getData();
    downloadDataInterval = setInterval(getData, 5 * 60 * 1000);
}

module.exports.stop = function(){
    clearInterval(downloadDataInterval);
}