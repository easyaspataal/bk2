const sendTransPayment = (mobile, amount, transaction) => {

    var http = require("https");

    var options = {
        "method": "POST",
        "hostname": "api.msg91.com",
        "port": null,
        "path": "/api/v5/flow?template_id=1207163481747177455",
        "headers": {
            "authkey": "360268Ah5fNkm0U6173b66cP1",
            "content-type": "application/JSON"
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
        });
    });
    req.write("{\n  \"flow_id\": \"6173adc8fc4242780554a926\",\n  \"mobiles\": \"91" + mobile + "\",\n  \"var1\": " + amount + ",\n  \"var2\": " + transaction + "\n}");
    req.end();
}
module.exports = sendTransPayment;



