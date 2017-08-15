const Client = require('node-rest-client').Client;
var restClient = new Client();
const JsonFile = require('jsonfile')


module.exports = class{
    constructor(){
    }

    save(data, file){
        JsonFile.writeFile("../Data/Cache/" + file, data, function (err) {
            if(err != undefined)
                console.error(err)
            else
                console.log("Wrote to cache: " + file)
        });
    }

    saveCSV(data, file){
        var fs = require('fs')
        var writer = fs.createWriteStream("../Data/Cache/" + file, {
        flags: 'a' // 'a' means appending (old data will be preserved)
        })
        for(let i = 0; i < data.length; i++)
            writer.write(data[i].join(";") + "\n");

        writer.end();
    }

    load(file, callback){
        JsonFile.readFile("../Data/Cache/" + file, function(err, obj){
            if(err == undefined)
                callback(obj);
            else 
            console.log(err);
        });
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
        
        let file = "../Data/Cache/" + "downloaded-" + from + "-" + to + "-" + instrument + "-" + interval + ".json";
        JsonFile.readFile(file, function(err, obj){
            if(err == undefined){
                console.log("Loading from cache: " + instrument);
                callback(obj);
            }
            else{
                console.log("Downloading from server: " + instrument);
                restClient.get(url + "/export", 
                    { 
                        parameters: { from: from, to: to, instrument: instrument, interval: interval },
                        requestConfig: {
                            timeout: 2 * 60 * 1000, //request timeout in milliseconds 
                            noDelay: true, //Enable/disable the Nagle algorithm 
                            keepAlive: true, //Enable/disable keep-alive functionalityidle socket. 
                            keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent 
                        },
                        responseConfig: {
                            timeout: 2 * 60 * 1000 //response timeout 
                        } 
                    },
                    function (data, response) {
                        JsonFile.writeFile(file, data.data, function (err) {
                            if(err != undefined)
                                console.error(err)
                            else
                                console.log("Wrote to cache: " + instrument)
                        });
                        callback(data.data);
                    }
                );
            }
        });
    }

    upsample(from, to, interval, downsampledData, maxDataAge){
        let dataIndex = 1;
        let output = [];

        output.push(downsampledData[0]); //Header

        for(let timestamp = from; timestamp <= to; timestamp += interval)
        {
            while(dataIndex + 1 < downsampledData.length && downsampledData[dataIndex + 1][0] <= timestamp)
                dataIndex += 1;

            let dataAge = timestamp - downsampledData[dataIndex][0];
            if(dataAge < maxDataAge){
                let arr = [];
                arr.push(timestamp);
                for(let i = 1; i < downsampledData[dataIndex].length; i++)
                    arr.push(downsampledData[dataIndex][i]);
                output.push(arr);
            }
            else{
                let arr = [];
                arr.push(timestamp);
                for(let i = 1; i < downsampledData[dataIndex].length; i++)
                    arr.push(NaN);
                output.push(arr);
            }
        }

        return output;
    }

    addIndicator(indicator, data, fundamentalIndex){
        data[0].push("technical_" + indicator.name);

        for(let i = 1; i < data.length; i++)
            if(isNaN(data[i][fundamentalIndex]) == false)
                data[i].push(indicator.nextValue(data[i][fundamentalIndex]));
            else
                data[i].push(NaN);
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

    getValueDistribution(data, index){
        let distribution = {};
        for(let row = 0; row < data.length; row++){
            let value = data[row][index];
            if(distribution[value] == undefined)
                distribution[value] = 1;
            else
                distribution[value]++;
        }

        for(let key in distribution)
            distribution[key] /= data.length;
        
        return distribution;
    }

    combineData(targetData, additionData){
        for(let row = 0; row < additionData.length; row++){ //Iterate rows
            if(row == 0) //Add header
                for(let column = 1; column < additionData[0].length; column++)
                    targetData[0].push(additionData[0][column]); //Add all columns (except timestamp)
            else
                if(additionData[row][0] == targetData[row][0]) //Timestamps identical
                    for(let column = 1; column < additionData[row].length; column++)
                        targetData[row].push(additionData[row][column]); //Add all columns (except timestamp)
        }
    }

    addDerived(targetData, name, deriveFunction){
        targetData[0].push("derived_" + name);
        for(let row = 1; row < targetData.length; row++)
            targetData[row].push(deriveFunction(targetData[row]));
    }

    getColumnIndex(data, name){
        for(let column = 0; column < data[0].length; column++)
            if(data[0][column] == name)
                return column;
        
        console.log("Column " + name + " not found in header: " + data[0]);
        return -1;
    }

    getIndicatorCorrelation(indicator, data, fundamentalIndex, outcomeIndex){

        //Collect all indicator values with each outcomeCode
        let outcomeToValues = {};
        for(let i = 1; i < data.length; i++){ //i = 0 -> Header
            if(isNaN(data[i][fundamentalIndex]) == false){
                let indicatorValue = indicator.nextValue(data[i][fundamentalIndex]);
                if(isNaN(data[i][outcomeIndex]) == false && isNaN(indicatorValue) == false)
                {
                    if(outcomeToValues[data[i][outcomeIndex]] == undefined)
                        outcomeToValues[data[i][outcomeIndex]] = [];
                    
                    outcomeToValues[data[i][outcomeIndex]].push(indicatorValue);
                }
            }
        }

        //Average out all indicator values with the outcome code
        let outcomeToAverages = {};
        for(let outcomeValue in outcomeToValues)
        {
            outcomeToAverages[outcomeValue] = 0;

            let samples = 0;
            for(let i = 0; i < outcomeToValues[outcomeValue].length; i++){
                if(isFinite(outcomeToValues[outcomeValue][i])){
                    outcomeToAverages[outcomeValue] += outcomeToValues[outcomeValue][i];
                    samples++;
                }
            }

            outcomeToAverages[outcomeValue] /= samples;
        }

        //Get the distance between the averages
        let avgSum = 0;
        let avgItems = 0;

        let keys = Object.keys(outcomeToAverages);
        for(let i = 0; i < keys.length; i++)
            for(let a = i + 1; a < keys.length; a++)
            {
                avgSum += Math.abs(outcomeToAverages[keys[i]] - outcomeToAverages[keys[a]]);
                avgItems++;
            }

        //The average distance
        return avgSum / avgItems;
    }
}