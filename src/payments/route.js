/* ----------------- This File Sets Up The Routes Used For Server Sent Events On UI Hospitals ----------------- */
// Created : 30-8-2021 by Prayag
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const router = require("express-promise-router")();
const SaveController = require("./SaveData");
/* ------------------------------------------------------------------------------------------------------------------ */


// Get all Hospitals
// 30-8-2021 Prayag
router
	.route("/startpayment")
	.post(SaveController.InitiatePayment);

router
	.route("/splitpayment")
	.post(SaveController.SplitPayment);

// Save Payment
// 26-10-2021 Prayag
router
	.route("/savepayment")
	.post(SaveController.SavePayment);

// Go Cashless Service
// 24-11-2021 Prayag
router 
	.route("/startgocashless")
	.post(SaveController.GoCashlessEmail);

// Jira payment update
// 8-2-2022 Sampat
router
	.route("/startfullpayment")
	.post(SaveController.UpdateJiraStatus);

router
	.route("/smsqrpaymnet")
	.post(SaveController.SmsQrPayment);

	router
	.route("/sendpulseqr")
	.post(SaveController.SendPulseQr);	

	router
	.route("/sendpulseagg")
	.post(SaveController.SendPulseAgg);	

router
.route("/emandate")
.post(SaveController.Emandate);

router
.route("/agentpay")
.post(SaveController.AgentPayment);

router
.route("/emandatestatus")
.post(SaveController.EmandateStatus);

module.exports = router;
