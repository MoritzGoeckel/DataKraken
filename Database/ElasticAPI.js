const elasticsearch = require('elasticsearch');
const AgentKeepAlive = require('agentkeepalive');

module.exports = class{

    constructor(host){
        this.client = new elasticsearch.Client({
            hosts: [host],
            maxRetries: 10,
            keepAlive: true,
            maxSockets: 10,
            minSockets: 10,
            createNodeAgent: function (connection, config) {
                return new AgentKeepAlive(connection.makeAgentConfig(config));
            },
            log: 'error',
            requestTimeout: 20 * 1000
        });
    }

    initDatabase(){
        let base = this;

        this.client.delete({
            index: 'ts_data',
            type: '',
            id: ''
            }, function (err, resp) {
            if(err != null && err != undefined)
                console.log(err);
            
            base.client.index({
                index: 'ts_data',
                type: 'standart',
                id: '',
                body: {  }
                }, function (err, resp) {
                if(err != null && err != undefined)
                    console.log(err);
                
                base.client.indices.putMapping({
                    body: 
                    {
                        "standart":{
                            "properties":{
                                "timestamp": {
                                    "type" : "date"
                                },
                                "name":{
                                    "type" : "keyword"
                                },
                                "value":{
                                    "type" : "double"
                                }
                            }
                        }
                    },
                    type: "standart",
                    index: "ts_data"
                    },function (err, resp) {
                    if(err != null && err != undefined)
                        console.log(err);

                    console.log(resp);
                });

                console.log(resp);
            });

            console.log(resp);
        });
    }

    sendToES(body, callbackSucess){
        let base = this;

        this.client.bulk({ body: body }, function (err, resp) {
            if(err != null && err != undefined){
                setTimeout(function(){ base.sendToES(body, callbackSucess); }, 0);         
            
                console.log("ES Insert failed: " + err.message); 
            }
            else{
                callbackSucess();
            }
        });
    }

    indexSample(samples, callbackSucess){
        let body = [];
        for(let i = 0; i < samples.length; i++)
        {
            body.push({ index:  { _index: "ts_data", _type: "standart" } });
            body.push( samples[i] );
        }

        this.sendToES(body, callbackSucess);
    }

    getTypes(callback){
        this.client.search({
            "index": "ts_data", 
            "type": "standart",
            body: {
                "aggs" : {
                    "names" : {
                        "terms" : { "field" : "name" , "size" : 8000}
                    }
                }
            }
        }, function(err, res){ 
            if(res.aggregations.names.sum_other_doc_count != 0) 
                console.log("There are more documents then displayed!");
                
            callback(res.aggregations.names.buckets); 
        });
    }

    getData(from, to, name, callback){
        let allRecords = [];
        let base = this;

        //"size" : 1000 * 5,

        this.client.search({
            "index": "ts_data", 
            "type": "standart",
            "scroll": '30s',
            body: {
                "sort" : [ { "timestamp" : {"order" : "asc"}} ],
                "size": 50000, //Richtig? TODO
                "query" : {
                    "bool": {
                        "must": [
                            {"term" : { "name" : name }},
                            {"range" : 
                                {
                                    "timestamp" : 
                                    {
                                        "gte" : from,
                                        "lt" : to,
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }, 
        function getMoreUntilDone(error, response) {
            response.hits.hits.forEach(function (hit) {
                allRecords.push(hit._source);
            });
            if (response.hits.total !== allRecords.length) {
                base.client.scroll({
                    scrollId: response._scroll_id,
                    scroll: '10s'
                }, getMoreUntilDone);
            } else {
                callback(allRecords);
            }
        })
    }
}