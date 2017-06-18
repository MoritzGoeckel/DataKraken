let Exporter = require('../Export/Exporter.js');
let Enricher = require('../Enrichment/Enricher.js');

let enricher = new Enricher();

indicatorStub = {
    nextValue: function(v){ return v + (v / 10); },
    name: "indicatorStub"
};

//http://37.120.167.209:55459/export?from=1497652960505&to=1497739360505&instrument=coincap_xvc_price&interval=1000
//&from=1497542779803&to=1497646589875
enricher.download(undefined, 1497542779803, 1497646589875, "oanda_eurusd_ask", 1000, function(data){
    let upsampled = enricher.upsample(1497542779803, 1497646589875, 1000, data);
    console.log(data.length + " -> " + upsampled.length);

    console.log("## AverageDistance ##")
    let avgDist = enricher.getAverageDistance(upsampled, 60 * 10, 1);
    console.log(avgDist);

    console.log("## Outcome ##")
    enricher.addResolvedHard(upsampled, 60 * 10, avgDist * 10, 1);
    console.log(upsampled.length);
});

 /*console.log("## Downampled ##")
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
 console.log(upsamped);*/