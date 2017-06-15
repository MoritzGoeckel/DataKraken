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

    getData(from, to, name, callback){
        let allRecords = [];
        let base = this;

        //"size" : 1000 * 5,

        this.client.search({
            "index": "ts_data", 
            "type": "standart",
            "scroll": '10s',
            body: {
                "from" : 0, 
                "sort" : [ { "timestamp" : {"order" : "asc"}} ],
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