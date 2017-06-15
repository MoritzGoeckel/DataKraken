module.exports.registerListener = function (onData)
{
    var WebSocketClient = require('websocket').client;
    var client = new WebSocketClient();

    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });
    
    client.on('connect', function(connection) {
        //console.log('WebSocket Client Connected');

        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        
        connection.on('close', function() {
            //console.log('echo-protocol Connection Closed');
        });

        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                //let data = JSON.parse(message.utf8Data);

                if(message.utf8Data.startsWith("42")){
                    let obj = JSON.parse("{\"content\":" + message.utf8Data.substring(2) + "}").content;
                    if(obj[0] == "tradeAndVolume"){
                        onData("coincap", obj[1].message.msg.pair1, {"price":obj[1].message.msg.pair1Price})
                        onData("coincap", obj[1].message.msg.pair2, {"price":obj[1].message.msg.pair2Price})
                    }

                    if(obj[0] == "trades"){
                        onData("coincap", obj[1].message.coin.toLowerCase(), {"price":obj[1].message.msg.price, "volume":obj[1].message.msg.usdVolume})
                    }
                }
            }
        });
        
        setInterval(function(){ connection.sendUTF("2"); }, 25 * 1000);
    });
    
    client.connect('ws://socket.coincap.io/socket.io/?EIO=3&transport=websocket', '', {});
}

module.exports.stop = function(){
    
}