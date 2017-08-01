const request = require("request");

let downloadDataInterval;

module.exports.registerListener = function (onData)
{
    function getData(){
        request("http://www.coincap.io/front", function(err, res){
            
            if(err != null)
                console.log(err);
            
            //Sometimes it returns a html page
            resp = [];
            try{
                resp = JSON.parse(res.body);
            }
            catch(exception){
                console.error("CoincapHTTP Error: Could not parse JSON");
                console.error("Got exception:");
                console.error(exception);
                console.error("Recieved response:");
                console.error(resp);
            }

            for(let r in resp){
                let output = {};
                let id = resp[r].short.toLowerCase();
                output.price = parseFloat(resp[r].price);
                output.volume = parseFloat(resp[r].usdVolume);
                output.cap = parseFloat(resp[r].mktcap);
                output.supply = parseFloat(resp[r].supply);

                onData("coincap", id, output);
            }
        });
    }

    getData();
    downloadDataInterval = setInterval(getData, 10 * 1000);
}

module.exports.stop = function(){
    clearInterval(downloadDataInterval);
}