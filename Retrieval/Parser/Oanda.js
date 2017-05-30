var OANDAAdapter = require('oanda-adapter');

module.exports.registerListener = function (onData)
{

    var client = new OANDAAdapter({
        // 'live', 'practice' or 'sandbox' 
        environment: 'practice',
        // Generate your API access in the 'Manage API Access' section of 'My Account' on OANDA's website 
        accessToken: '1fe66ad3be0bf2d4fa579667945faa15-656562a41bc087ed9c6e91f3b3947f99',
        // Optional. Required only if evironment is 'sandbox' 
        //username: 'a837f0927f0b0cd630a0934059c87003-7eb890aff42eb9c985305b309a94e421'
    });

    let accounts = client.getAccounts(function(error, accounts){

        function subscribe(instrument){
            client.subscribePrice(accounts[0].accountId, instrument, function (tick) {
                delete tick.time;
                delete tick.instrument;
                onData("oanda", instrument, tick);
            }, this);
        }

        client.getInstruments(accounts[0].accountId, function(error, instruments){
            for(let i in instruments)
                subscribe(instruments[i].instrument);
        });
    });

}