const Indicators = require('technicalindicators');
const ValueMinusIndicator = require("./indicator_wrapper/ValueMinusIndicator.js");
const ChooseAttributeIndicator = require("./indicator_wrapper/ChooseAttributeIndicator.js");
const LowerMiddleUpperIndicator = require("./indicator_wrapper/LowerMiddleUpperIndicator.js");

module.exports = class{
    
    constructor(minTimeframe, maxTimeframe){
        this.minTimeframe = minTimeframe;
        this.maxTimeframe = maxTimeframe;
    }

    getIndicators(){
        let output = [];
        let base = this;

        function generatePeriods(steps, fn)
        {
            let minToMax = base.maxTimeframe - base.minTimeframe;
            for(let i = 0; i <= steps; i++){
                let period = Math.floor(base.minTimeframe + (i * minToMax / steps));
                fn(period);
            }
        }

        // MACD
        /*generatePeriods(5, function(period){
            let tmp = new ChooseAttributeIndicator(new Indicators.MACD({values : [],
                fastPeriod        : period,
                slowPeriod        : period / 2,
                signalPeriod      : period / 1.5,
                SimpleMAOscillator: false,
                SimpleMASignal    : false}), "histogram");

            tmp.name = "MACD_" + period + "_" + 1.3;
            output.push(tmp);
        });*/

        // BB
        generatePeriods(5, function(period){
            for(let std = 1; std < 4; std++)
            {
                let tmp = new LowerMiddleUpperIndicator(new Indicators.BollingerBands({values : [],
                    period: period,
                    stdDev: std}));

                tmp.name = "BB_" + period + "_" + std;
                output.push(tmp);
            }
        });

        //SMA
        generatePeriods(5, function(period){
            let tmp = new ValueMinusIndicator(new Indicators.SMA({period : period, values : []}));
            tmp.name = "SMA_" + period;
            output.push(tmp);
        });

        // EMA
        generatePeriods(5, function(period){
            let tmp = new ValueMinusIndicator(new Indicators.EMA({period : period, values : []}));
            tmp.name = "EMA_" + period;
            output.push(tmp);
        });

        // WMA
        generatePeriods(5, function(period){
            let tmp = new ValueMinusIndicator(new Indicators.WMA({period : period, values : []}))
            tmp.name = "WMA_" + period;
            output.push(tmp);
        });

        // RSI
        generatePeriods(10, function(period){
            let tmp = new Indicators.RSI({period : period, values : []})
            tmp.name = "RSI_" + period;
            output.push(tmp);
        });

        // WEMA
        generatePeriods(10, function(period){
            let tmp = new ValueMinusIndicator(new Indicators.WEMA({period : period, values : []}))
            tmp.name = "WEMA_" + period;
            output.push(tmp);
        });

        // ROC
        generatePeriods(10, function(period){
            let tmp = new Indicators.ROC({period : period, values : []})
            tmp.name = "ROC_" + period;
            output.push(tmp);
        });

        // TRX
        generatePeriods(10, function(period){
            let tmp = new ValueMinusIndicator(new Indicators.TRIX({period : period, values : []}));
            tmp.name = "TRIX_" + period;
            output.push(tmp);
        });

        return output;
    }

}

// KST
// https://runkit.com/anandaravindan/kst
// = kst?
/*var input = {
  values: [],
  ROCPer1     : 10,
  ROCPer2     : 15,
  ROCPer3     : 20,
  ROCPer4     : 30,
  SMAROCPer1  : 10,
  SMAROCPer2  : 10,
  SMAROCPer3  : 10,
  SMAROCPer4  : 15,
  signalPeriod: 3
};*/

// KD (Needs heigh low close)
// https://runkit.com/anandaravindan/stochastic

// W%C (Needs heigh low close)
// https://runkit.com/anandaravindan/williamsr

// ADL (Needs heigh low close volume)
// https://runkit.com/anandaravindan/adl

// ATR
// Heigh low close data required.
// https://runkit.com/anandaravindan/atr