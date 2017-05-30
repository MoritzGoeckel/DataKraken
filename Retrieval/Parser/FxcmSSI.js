let request = require("request");

let downloadDataInterval;

module.exports.registerListener = function (onData)
{
    //let instruments = ["eurusd", "gbpusd", "USDJPY", "USDCHF", "EURCHF", "AUDUSD", "USDCAD", "NZDUSD", ];

    let allInstruments = ["EURUSD","USDJPY","GBPUSD","USDCHF","EURCHF","AUDUSD","USDCAD","NZDUSD","EURGBP","EURJPY","GBPJPY","CHFJPY","GBPCHF","EURAUD","EURCAD","AUDCAD","AUDJPY","CADJPY",
        "NZDJPY","GBPCAD","GBPNZD","GBPAUD","AUDNZD","USDSEK","EURSEK","EURNOK","USDNOK","USDMXN","AUDCHF","EURNZD","USDZAR","USDHKD","USDTRY","EURTRY","NZDCHF","CADCHF","NZDCAD","TRYJPY","USDILS",
        "USDCNH","AUS200","ESP35","FRA40","GER30","HKG33","JPN225","NAS100","SPX500","UK100","US30","Copper","EUSTX50","USDOLLAR","USOil","UKOil","NGAS","Bund","XAUUSD","XAGUSD"];

    let instruments = ["GBPCHF", "AUDUSD", "XAUUSD", "AUDNZD", "AUDJPY", "USDCAD", "EURCHF", "EURUSD", "USDCHF", "GBPJPY", "EURGBP", "USDJPY", "EURJPY", "NZDUSD", "GBPUSD"];

    function getData(instrument){
        request("http://www.fxblue.com/woc/_WocCurrentFeed.aspx?s=" + instrument + "&rx=1442515612434", function(err, res){
            
            if(err != null)
                console.log(err);

            let body = res.body;
            body = body.replace("symbol", "\"symbol\"");
            body = body.replace("isUsable", "\"isUsable\"");
            body = body.replace("longWin", "\"longWin\"");
            body = body.replace("longLoss", "\"longLoss\"");
            body = body.replace("shortWin", "\"shortWin\"");
            body = body.replace("shortLoss", "\"shortLoss\"");
            body = body.replace("percentOfTotalTraders", "\"percentOfTotalTraders\"");
            body = body.replace("(", "");
            body = body.replace(")", "");

            let data = JSON.parse(body);

            if(data.isUsable == 1){
                delete data.isUsable;
                delete data.symbol;
                onData("fxcmssi", instrument, data);
            }
            else
                console.log("FxcmSSI: " + instrument + " is unusable");
        });
    }

    function getAllData(){
        for(let i in instruments)
            getData(instruments[i]);
    }

    getAllData();
    downloadDataInterval = setInterval(getAllData, 15 * 1000);
}

module.exports.stop = function(){
    clearInterval(downloadDataInterval);
}