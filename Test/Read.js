const TimeHelper = require('../Time/Time.js');
let time = new TimeHelper();

const ES_API = require('../Database/ElasticAPI.js');

let es = new ES_API("localhost:9200");

es.getData(
    time.getUTCTimestamp() - 1000 * 60 * 60 * 500, 
    time.getUTCTimestamp(), 
    "oanda_gbpusd_ask", 
    function(resp){
        console.log(JSON.stringify(resp)); 
        console.log(resp.length)
    }
);