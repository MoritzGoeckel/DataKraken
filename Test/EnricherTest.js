let Exporter = require('../Export/Exporter.js');
let Enricher = require('../Enrichment/Enricher.js');

let enricher = new Enricher();

elasticStub = {
    getData: function(from, to, instrument, callback){
        callback([ {timestamp:0, value:0}, {timestamp:1, value:1}, 
                {timestamp:2, value:2}, {timestamp:9, value:9}, 
                {timestamp:10, value:10}, {timestamp:11, value:11}, 
                {timestamp:20, value:20}, {timestamp:35, value:35}, 
                {timestamp:40, value:40}, {timestamp:49, value:49},
                {timestamp:55, value:55}, {timestamp:70, value:70},
                {timestamp:100, value:100}, {timestamp:150, value:150},
                {timestamp:159, value:159}, {timestamp:161, value:161}
            ]);
    }
};

indicatorStub = {
    nextValue: function(v){ return v + (v / 10); },
    name: "indicatorStub"
};

let exporter = new Exporter(elasticStub);
exporter.getDownsampledArray(0, 150, "Inst", 10, function(res){
 
 console.log("## Original ##")
 elasticStub.getData(0,0,0, console.log);

 console.log("## Downampled ##")
 console.log(res);

 console.log("## Upsampled ##")
 let upsamped = enricher.upsample(0, 200, 10, res);
 console.log(upsamped);

 console.log("## Enriched ##")
 enricher.addIndicator(indicatorStub, upsamped, 1);
 console.log(upsamped);

 console.log("## AverageDistance ##")
 console.log(enricher.getAverageDistance(upsamped, 3, 1));

  console.log("## Outcome ##")
 enricher.addResolvedHard(upsamped, 3, 20, 1);
 console.log(upsamped);
});