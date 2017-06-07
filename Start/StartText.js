const DownloadQueue = require("../Retrieval/Download/DownloadQueue.js");
const LinkCollection = require("../Retrieval/TextpageParser/LinkCollection.js");

const Sources = require("../Data/Sources.json");
const Keywords = require("../Data/Keywords.json");
const Sentiment = require("../Data/Sentiment.json");



let q = new DownloadQueue(3, false);

for(let s in Sources){
    enque(Sources[s]);
}

//enque({"url": "https://seekingalpha.com/market-news", "name": "seekingalpha", "id":"ska"});

let overview = {};

function enque(source){
    q.enqueDownload(source.url, function(url, error, response, body){
        let c = new LinkCollection(body, source.id, url);
        if(c.links.length == 0)
            console.log("###### Seems to be a problem here: " + url);
        
        for(let l in c.links)
            for(let w in Keywords)
                if(c.links[l].title.toLowerCase().indexOf(w) != -1){
                    
                    let symbol = Keywords[w];
                    let sent = "";
                    let good = 0;
                    let bad = 0;

                    for(let s in Sentiment)
                        if(c.links[l].title.toLowerCase().indexOf(s) != -1){
                            if(Sentiment[s] > 0){
                                sent += "+";
                                good++;
                            }else
                            {
                                sent += "-";
                                bad++;
                            }
                        }

                    //console.log(sent + " " + Keywords[w] + " -> " + c.links[l].title);

                    if(overview[symbol] == undefined)
                         overview[symbol] = {positive:good, negative:bad, samples:1};
                    else
                    {
                        overview[symbol].positive += good;
                        overview[symbol].negative += bad;
                        overview[symbol].samples++;
                    }           
                }

        if(q.getQueueLength() == 0 && q.getOpenConnections() == 0)
            console.log(overview);
    });
}