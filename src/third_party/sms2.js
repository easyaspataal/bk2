const sendsms = () => {

    var http = require("https");
    var options = {
      "method": "POST",
      "hostname": "api.msg91.com",
      "port": null,
      "path": "/api/v5/flow/",
      "headers": {
        "authkey": "360268AxhYdgzQ6094c08eP1",
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
    req.write("{\n  \"flow_id\": \"60c44fa24eceb260916ac8d5\",\n  \"mobiles\": \"919586975757\",\n  \"name\": \"Sumit\",\n  \"addr1\": \"Jupiter\",\n  \"addr2\": \"Thane\",\n  \"date\": \"12-06-2021\",\n  \"time\": \"16:00\",\n  \"contact\": \"123456789\"\n}");    req.end();
  
  }
  
  module.exports = sendsms;
  
  
  