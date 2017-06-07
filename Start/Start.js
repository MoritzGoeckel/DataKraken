let parsers = [
        require('../Retrieval/TimeseriesParser/BitcoinCharts.js'),
        require('../Retrieval/TimeseriesParser/Oanda.js'),
        require('../Retrieval/TimeseriesParser/FxcmSSI.js'),
        require('../Retrieval/TimeseriesParser/FXCM.js'),
        require('../Retrieval/TimeseriesParser/CoinCap.js')      
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

function gotNewData(source, id, valueName, value){
    console.log(source + "|" + id.replace("_", "").toLowerCase() + "|" + valueName.toLowerCase() + " -> " + value);    
}