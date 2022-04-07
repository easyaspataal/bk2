const sendsms = (otp, mobile) => {

    var http = require("https");
    var options = {
      "method": "GET",
      "hostname": "api.msg91.com",
      "port": null,
      "path": "/api/v5/otp?template_id=60c738f208b9cb630810e9d9&mobile=91" + mobile + "&authkey=360268AxhYdgzQ6094c08eP1&otp="+otp+"",
      "headers": {
        "content-type": "application/json"
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
    req.end();
}
module.exports = sendsms;


