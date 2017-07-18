const TimeHelper = require('../Time/Time.js');
const ES_API = require('../Database/ElasticAPI.js');

const insertInterval = 5 * 1000;


let es = new ES_API("localhost:9200");
//es.initDatabase();

let time = new TimeHelper();
console.log("It is " + time.getUTCDate());

let parsers = [
        require('../Retrieval/TimeseriesParser/BitcoinCharts.js'),
        require('../Retrieval/TimeseriesParser/Oanda.js'),
        require('../Retrieval/TimeseriesParser/FxcmSSI.js'),
        require('../Retrieval/TimeseriesParser/FXCM.js'),
        require('../Retrieval/TimeseriesParser/CoinCap.js'),
        require('../Retrieval/TimeseriesParser/Coinmarketcap.js')                    
    ];

for(let p in parsers){
    parsers[p].registerListener(onTickdataData)
}

let changeDict = {};

function onTickdataData(source, id, data){
    let name = source+"|"+id;

    for(let v in data){
        let valueName = name + "|" + v;
        if(changeDict[valueName] == undefined || changeDict[valueName] != data[v]){
            changeDict[valueName] = data[v];
            gotNewData(source, id, v, data[v]);
        }
    }
}

let q = [];
function gotNewData(source, id, valueName, value){
    let name = source + "_" + id.replace("_", "").toLowerCase() + "_" + valueName.toLowerCase();
    q.push({
        name:name, 
        timestamp:time.getUTCTimestamp(), 
        value:value
    });
}

setInterval(function(){
    if(q.length != 0){
        let count = q.length;
        es.indexSample(q, function(){ console.log("receiving " + (count / insertInterval * 1000) + "/s") });
        q = [];
    }
}, insertInterval);
