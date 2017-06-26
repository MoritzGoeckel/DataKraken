const Importer = require('../Export/Importer.js');
const Enricher = require('../Enrichment/Enricher.js');
const Generator = require('../Enrichment/IndicatorGenerator.js');

let gen = new Generator(60, 60 * 60);
let enricher = new Enricher();
let importer = new Importer([   "oanda_eurusd_ask", "oanda_eurusd_bid", 
                                "fxcmssi_eurusd_shortloss", "fxcmssi_eurusd_shortwin", 
                                "fxcmssi_eurusd_longloss", "fxcmssi_eurusd_longwin", 
                                "fxcmssi_eurusd_percentoftotaltraders", 
                                "fxcm_eurusd_bid", "fxcm_eurusd_ask"    ]);

console.log("Download");
importer.download(1497542779803, 1497646589875, 1000, 60 * 10 * 1000, function(data){
    let llIndex = enricher.getColumnIndex(data, "fundamental_fxcmssi_eurusd_longloss");
    let lwIndex = enricher.getColumnIndex(data, "fundamental_fxcmssi_eurusd_longwin");

    let slIndex = enricher.getColumnIndex(data, "fundamental_fxcmssi_eurusd_shortloss");
    let swIndex = enricher.getColumnIndex(data, "fundamental_fxcmssi_eurusd_shortwin");
    
    let fxcmBidIndex = enricher.getColumnIndex(data, "fundamental_fxcm_eurusd_bid");
    let fxcmAskIndex = enricher.getColumnIndex(data, "fundamental_fxcm_eurusd_ask");
    let oandaBidIndex = enricher.getColumnIndex(data, "fundamental_oanda_eurusd_bid");
    let oandaAskIndex = enricher.getColumnIndex(data, "fundamental_oanda_eurusd_ask");

    enricher.addDerived(data, "long", function(row){ return row[llIndex] + row[lwIndex]; });
    enricher.addDerived(data, "long_right", function(row){ return row[lwIndex] / row[llIndex]; });
    enricher.addDerived(data, "short_right", function(row){ return row[swIndex] / row[slIndex]; });
    
    enricher.addDerived(data, "fxcm_spread", function(row){ return row[fxcmAskIndex] - row[fxcmBidIndex]; });
    enricher.addDerived(data, "oanda_spread", function(row){ return row[oandaAskIndex] - row[oandaBidIndex]; });
    
    enricher.addDerived(data, "fxcm_oanda_diff", function(row){ return ((row[fxcmAskIndex] + row[fxcmBidIndex]) / 2) - ((row[oandaAskIndex] + row[oandaBidIndex]) / 2); });    
    
    enricher.addResolvedHard(data, 10 * 60, enricher.getAverageDistance(data, 10 * 60, oandaBidIndex) * 2, oandaBidIndex); 

    let outcomeIndex = enricher.getColumnIndex(data, "outcome_hard_" + (10 * 60));

    let dist = enricher.getValueDistribution(data, outcomeIndex);

    let indicators = gen.getIndicators();
    for(let i in indicators){
        console.log("Checking " + i + "/" + indicators.length + ": " + indicators[i].name);
        console.log(enricher.getIndicatorCorrelation(indicators[i], data, fxcmBidIndex, outcomeIndex));
        //enricher.addIndicator(indicators[i], data, fxcmBidIndex);
    }

    enricher.save(data, "export.json");
    console.log("Written / Done");
    
    //console.log(dist)
    //console.log(data[0]);
    //console.log(data[1]);
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
 console.log(upsamped);
 
 console.log("## AverageDistance ##")
    let avgDist = enricher.getAverageDistance(upsampled, 60 * 10, 1);
    console.log(avgDist);

    console.log("## Outcome ##")
    enricher.addResolvedHard(upsampled, 60 * 10, avgDist * 10, 1);
    console.log(upsampled.length);
 
 */