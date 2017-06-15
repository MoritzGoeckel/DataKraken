const ES_API = require('../Database/ElasticAPI.js');
let es = new ES_API("localhost:9200");

es.getTypes(console.log)