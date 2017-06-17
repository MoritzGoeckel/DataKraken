const TimeHelper = require('../Time/Time.js');
const ES_API = require('../Database/ElasticAPI.js');
const Exporter = require('../Export/Exporter.js');

const Express = require('express');
const ExpressRest = require('express-rest');

let es = new ES_API("localhost:9200");

let exporter = new Exporter(es);

let exp = Express();
let rest = ExpressRest(exp);

let time = new TimeHelper();

//exp.use("/", Express.static(__dirname + '/frontend'));

rest.get('/export', function(req, rest) {
    if(req.query.from == undefined || req.query.to == undefined || req.query.instrument == undefined || req.query.interval == undefined)
        return rest.ok({query:req.query, result:"missing parameters"});

    exporter.getDownsampledArray(req.query.from, req.query.to, req.query.instrument, req.query.interval, function(res){
        return rest.ok({query:req.query, result:"ok", data:res});
    });
});

rest.get('/time', function(req, rest) {
    return rest.ok({now:time.getUTCDate(), ago48h:time.getUTCDate() - (48 * 60 * 60 * 1000), ago24h:time.getUTCDate() - (24 * 60 * 60 * 1000), ago96h:time.getUTCDate() - (96 * 60 * 60 * 1000)});
});

let listener = exp.listen(this.port, function(){
    console.log('Listening on port ' + listener.address().port);
});