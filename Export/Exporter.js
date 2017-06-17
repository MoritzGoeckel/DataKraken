module.exports = class{
    constructor(elastic){
        this.elastic = elastic;
    }

    getDownsampledArray(from, to, instrument, interval, callback){
        this.elastic.getData(from, to, instrument, function(records){
            let downsampled = [];
            let currentTime = from;
            let lastBeforeTimeSample = undefined;

            for(let r in records){
                if(records[r].timestamp <= currentTime)
                    lastBeforeTimeSample = records[r];
                else {
                    if(lastBeforeTimeSample != undefined){
                        downsampled.push([currentTime, lastBeforeTimeSample.value]);
                        lastBeforeTimeSample = undefined;
                    }

                    while(currentTime < records[r].timestamp)
                        currentTime += interval;

                    if(records[r].timestamp <= currentTime)
                        lastBeforeTimeSample = records[r];
                }
            }

            if(lastBeforeTimeSample != undefined)
                downsampled.push([currentTime, lastBeforeTimeSample.value]);

            downsampled.unshift(["fundamental_timestamp", "fundamental_"+instrument]);
            callback(downsampled);
        });
    }
}