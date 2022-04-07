/* ----------------- This File Sets Up The Routes Used For Server Sent Events On Admin ----------------- */
// Created : 9-4-2021 by Prayag
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const router = require("express-promise-router")();
const SaveController = require("../controllers/SaveData");
const FetchController = require("../controllers/FetchDetails");
/* ------------------------------------------------------------------------------------------------------------------ */


// Create Requests
// 27-4-2021 Prayag
router
	.route("/saverequest")
	.post(SaveController.CreateRequest);

// Send Requests OTP
// 21-6-2021 Prayag
router
	.route("/sendOTP")
	.post(SaveController.SendOTP);

module.exports = router;
