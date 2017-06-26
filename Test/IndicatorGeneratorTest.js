const Enricher = require('../Enrichment/Enricher.js');
const Generator = require('../Enrichment/IndicatorGenerator.js');

let gen = new Generator(20, 100);
console.log(gen.getIndicators().length);