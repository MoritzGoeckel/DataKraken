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
importer.download(1502449762699, 1502795362684, 1000 * 60, 10 * 60 * 1000, function(data){
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
    enricher.save(data, "export.json");
    console.log("Written / Done");
});