module.exports = class{
    constructor(){
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