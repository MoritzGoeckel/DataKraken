const TimeHelper = require('../Time/Time.js');
const ES_API = require('../Database/ElasticAPI.js');
const Exporter = require('../Export/Exporter.js');

const Express = require('express');
const ExpressRest = require('express-rest');

let es = new ES_API("localhost:9200");

let exporter = new Exporter(es);

let exp = Express();
let rest = ExpressRest(exp);

//exp.use("/", Express.static(__dirname + '/frontend'));

rest.get('/export', function(req, rest) {
    console.log(req.params.query);
    exporter.getDownsampledArray(0, 150, "Inst", 10, function(res){
        return rest.ok(res);
    });
});

let listener = exp.listen(this.port, function(){
    console.log('Listening on port ' + listener.address().port);
});