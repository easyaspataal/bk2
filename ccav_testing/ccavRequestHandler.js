var http = require("http"),
	fs = require("fs"),
	ccav = require("./ccavutil"),
	qs = require("querystring");

exports.postReq = function (request, response) {
	var body = "",
		workingKey = "CD63B500BF85222FC4BAA7FC3962A6E2", //Put in the 32-Bit key shared by CCAvenues.
		accessCode = "AVAJ03HJ48BD50JADB", //Put in the access code shared by CCAvenues.
		encRequest = "",
		formbody = "";
	request.on("data", function (data) {
		body += data;

		encRequest = ccav.encrypt(body, workingKey);
		formbody =
			'<form id="nonseamless" method="post" name="redirect" action="https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="' +
			encRequest +
			'"><input type="hidden" name="access_code" id="access_code" value="' +
			accessCode +
			'"><script language="javascript">document.redirect.submit();</script></form>';
	});

	request.on("end", function () {
		response.writeHeader(200, { "Content-Type": "text/html" });
		response.write(formbody);
		response.end();
	});
	return;
};
