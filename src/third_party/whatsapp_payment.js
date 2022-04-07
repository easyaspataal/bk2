const sendWhatsappPayment = (mobile, amount, transaction) => {

    var axios = require('axios');
    var qs = require('qs');


    var optin = qs.stringify({
        'user': 91 + mobile,
    });
    var notify = {
        method: 'post',
        url: 'https://api.gupshup.io/sm/api/v1/app/opt/in/easptl',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'apikey': '4uw1hyourz8gxfimqq82wxkkh3okwh24'
        },
        data: optin
    };
    axios(notify)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });



    var amount;
    var transc_id;
    // if(notify){
    var data = qs.stringify({
        'channel': 'whatsapp',
        'source': '917292005098',
        'destination': '91' + mobile,
        'message': `{"type":"text","text":"A payment of Rs. ${amount} has been received. Transaction ID: ${transaction}"}`,
        'src.name': 'easptl'
    });
    var config = {
        method: 'post',
        url: 'https://api.gupshup.io/sm/api/v1/msg',
        headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded',
            'apikey': '4uw1hyourz8gxfimqq82wxkkh3okwh24',
            'cache-control': 'no-cache'
        },
        data: data
    };
    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });
    // }
}
module.exports = sendWhatsappPayment;



