let parsers = [
        require('../Retrieval/Parser/BitcoinCharts.js'),
        require('../Retrieval/Parser/Oanda.js'),
        require('../Retrieval/Parser/FxcmSSI.js'),
        require('../Retrieval/Parser/FXCM.js'),
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
    console.log(source + "|" + id + "|" + valueName + " -> " + value);    
}