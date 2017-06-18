var Client = require('node-rest-client').Client;
var restClient = new Client();

module.exports = class{
    constructor(){
    }

    download(url, from, to, instrument, interval, callback){ //coincap_xvc_price
        //http://37.120.167.209:55459/export?from=1497652960505&to=1497739360505&instrument=coincap_xvc_price&interval=1000
        /*var args = {
            data: { test: "hello" }, // data passed to REST method (only useful in POST, PUT or PATCH methods) 
            path: { "id": 120 }, // path substitution var 
            parameters: { arg1: "hello", arg2: "world" }, // this is serialized as URL parameters 
            headers: { "test-header": "client-api" } // request headers 
        };*/
        
        if(url == undefined)
            url = "http://37.120.167.209:55459";

        restClient.get(url + "/export", { parameters: { from: from, to: to, instrument: instrument, interval: interval } },
            function (data, response) {
                callback(data.data);
            }
        );
    }

    upsample(from, to, interval, downsampledData){
        let dataIndex = 1;
        let output = [];

        output.push(downsampledData[0]); //Header

        for(let timestamp = from; timestamp <= to; timestamp += interval){
            while(dataIndex + 1 < downsampledData.length && downsampledData[dataIndex + 1][0] <= timestamp)
                dataIndex += 1;

            output.push([timestamp, downsampledData[dataIndex][1]]);
        }

        return output;
    }

    addIndicator(indicator, data, fundamentalIndex){
        data[0].push("technical_" + indicator.name);

        for(let i = 1; i < data.length; i++)
            data[i].push(indicator.nextValue(data[i][fundamentalIndex]));
    }

    addResolvedHard(data, unitsTimeframe, distance, fundamentalIndex){
        data[0].push("outcome_hard_" + unitsTimeframe);
        for(let i = 1; i < data.length; i++){
            let diff = NaN;
            if(i + unitsTimeframe < data.length)
                diff = data[i + unitsTimeframe][fundamentalIndex] - data[i][fundamentalIndex];
            
            if(diff >= distance)
                data[i].push(1);
            if(diff <= -distance)
                data[i].push(-1);
            if(diff > -distance && diff < distance)
                data[i].push(0);
            if(isNaN(diff))
                data[i].push(NaN);
        }
    }

    getAverageDistance(data, unitsTimeframe, fundamentalIndex){
        let distanceSum = 0;
        for(let i = 1; i < data.length - unitsTimeframe; i++)
            distanceSum += Math.abs(data[i][fundamentalIndex] - data[i + unitsTimeframe][fundamentalIndex]);
        return distanceSum / (data.length - unitsTimeframe - 1);
    }
}