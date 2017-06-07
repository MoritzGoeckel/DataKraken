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
            index: '',
            type: '',
            id: ''
            }, function (err, resp) {
            if(err != null && err != undefined)
                console.log(err);
            
            /*base.client.index({
                index: 'newsdata',
                type: 'article',
                id: '',
                body: {  }
                }, function (err, resp) {
                if(err != null && err != undefined)
                    console.log(err);
                
                client.indices.putMapping({
                    body: 
                    {
                        "article":{
                            "properties":{
                                "claims": {
                                    "enabled": false,
                                    "type" : "object"
                                }
                            }
                        }
                    },
                    type: "article",
                    index: "newsdata"
                    },function (err, resp) {
                    if(err != null && err != undefined)
                        console.log(err);

                    console.log(resp);
                });

                console.log(resp);
            });*/

            console.log(resp);
        });
    }

    sendToES(body, callbackSucess){
        let base = this;

        this.client.bulk({ body: body }, function (err, resp) {
            if(err != null && err != undefined){
                setTimeout(function(){ base.sendToES(body); }, 0);         
            
                console.log("");
                console.log(err); 
                console.log("");
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
            body.push({ index:  { _index: samples[i].name, _type: "article" } });
            body.push( samples[i].payload );
        }

        this.sendToES(body, callbackSucess);
    }
}