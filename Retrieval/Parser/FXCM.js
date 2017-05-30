const request = require("request");
const parseString = require('xml2js').parseString;

let downloadDataInterval;

module.exports.registerListener = function (onData)
{
    function getData(){
        request("http://rates.fxcm.com/RatesXML", function(err, res){
            
            if(err != null)
                console.log(err);
            
            parseString(res.body, function(err, res){
                if(err != null)
                    console.log(err);
                
                for(let r in res.Rates.Rate){
                    let rate = res.Rates.Rate[r];
                    let name = rate.$.Symbol;
                    
                    onData("fxcm", name, {"bid":parseFloat(rate.Bid[0]), "ask":parseFloat(rate.Ask[0])});
                }
            });
        });
    }

    getData();
    downloadDataInterval = setInterval(getData, 15 * 1000);
}

module.exports.stop = function(){
    clearInterval(downloadDataInterval);
}