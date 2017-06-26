let Enricher = require('../Enrichment/Enricher.js');

//http://37.120.167.209:55459/types
module.exports = class{
    constructor(fundamentals){
        this.fundamentals = fundamentals;
        this.enricher = new Enricher();
    }

    download(from, to, interval, maxDataAge, callback){
        let base = this;
        let combined = undefined;
        function downloadNext(index){
            if(index >= base.fundamentals.length)
                callback(combined);
            else
                base.enricher.download(undefined, from, to, base.fundamentals[index], interval, function(data){
                    let upsampled = base.enricher.upsample(from, to, interval, data, maxDataAge);
                    console.log(data.length + " -> " + upsampled.length);

                    if(combined == undefined)
                        combined = upsampled;
                    else
                        base.enricher.combineData(combined, upsampled);

                    downloadNext(index + 1);
                });
        }

        downloadNext(0);
    }
}