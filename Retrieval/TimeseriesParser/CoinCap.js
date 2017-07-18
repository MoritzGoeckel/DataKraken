module.exports.registerListener = function (onData)
{
    var WebSocketClient = require('websocket').client;

    function startClient(){
        var client = new WebSocketClient();

        var interval = undefined;

        function restart(){
            console.log("Restarting websocket");
            setTimeout(function(){
                console.log("Retrying connecting with coincap");
                if(interval != undefined)
                    clearInterval(interval);
                startClient(); //Start new connection
            }, 1000 * 10);
        }

        client.on('connectFailed', function(error) {
            console.log('Connect Error: ' + error.toString());
            restart();
        });

        client.on('connect', function(connection) {
            connection.on('error', function(error) {
                console.log("Connection Error: " + error.toString());
                connection.close();
            });
            
            connection.on('close', function() {
                console.log('Connection closed!');
                restart();
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
                            onData("coincap", obj[1].message.coin.toLowerCase(), {"price":parseFloat(obj[1].message.msg.price), "volume":parseFloat(obj[1].message.msg.usdVolume)})
                        }
                    }
                }
            });
            
            interval = setInterval(function(){ connection.sendUTF("2"); }, 25 * 1000);
        });

        console.log("Connecting to coincap")
        client.connect('ws://socket.coincap.io/socket.io/?EIO=3&transport=websocket', '', {});    
    }

    startClient();
}

module.exports.stop = function(){
    
}