const Indicators = require('technicalindicators');
const ValueMinusIndicator = require("./indicator_wrapper/ValueMinusIndicator.js");
const ChooseAttributeIndicator = require("./indicator_wrapper/ChooseAttributeIndicator.js");
const LowerMiddleUpperIndicator = require("./indicator_wrapper/LowerMiddleUpperIndicator.js");

// SMA
new ValueMinusIndicator(new Indicators.SMA({period : 2 + i, values : []}))

// EMA
new ValueMinusIndicator(new Indicators.EMA({period : 2 + i, values : []}))

// WMA
new ValueMinusIndicator(new Indicators.WMA({period : 2 + i, values : []}))

// MACD
new ChooseAttributeIndicator(new Indicators.MACD({values : [],
    fastPeriod        : 3 + i,
    slowPeriod        : 6 + 2 * i,
    signalPeriod      : 1 + Math.floor(i / 2),
    SimpleMAOscillator: false,
    SimpleMASignal    : false}), "histogram")

// BB
for(let std = 1; std < 4; std++)
    for(let i = 1; i < 10; i++)
        new LowerMiddleUpperIndicator(new Indicators.BollingerBands({values : [],
            period: 1 + i,
            stdDev: std}))

// RSI
    new Indicators.RSI({period : 2 + i, values : []})

// WEMA
new ValueMinusIndicator(new Indicators.WEMA({period : 2 + i, values : []}))

// ROC
new Indicators.ROC({period : 2 + i, values : []})

// TRX
new ValueMinusIndicator(new Indicators.TRIX({period : 2 + i, values : []}))

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