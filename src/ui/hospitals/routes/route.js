/* ----------------- This File Sets Up The Routes Used For Server Sent Events On UI Hospitals ----------------- */
// Created : 30-8-2021 by Prayag
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const router = require("express-promise-router")();
const SaveController = require("../controllers/SaveData");
const FetchController = require("../controllers/FetchDetails");
/* ------------------------------------------------------------------------------------------------------------------ */


//bio score
//23-06-2022 pratik

router
	.route("/getbioscore")
	.get(FetchController.GetBioScore);

// Get all Hospitals
// 30-8-2021 Prayag
router
	.route("/getHospitals")
	.get(FetchController.GetHospitals);

// Get Selected Hospital
// 2-8-2021 Prayag
router
	.route("/getSelectedHospitals")
	.get(FetchController.GetSelectedHospitals);

// Send OTP
// 7-9-2021 Prayag
router
	.route("/checkUser")
	.post(SaveController.SendOTP);

// Onboard User
// 7-9-2021 Prayag
router
	.route("/eRegisterUser")
	.post(SaveController.RegisterUser);

// Easy Finance
// 7-9-2021 Prayag
router
	.route("/easyFinance")
	.post(SaveController.EasyFinance);

// PreAuth
// 7-9-2021 Prayag
router
	.route("/savePreauth")
	.post(SaveController.SavePreAuth);

// Insurance List
// 10-9-2021 Prayag
router
	.route("/getInsuranceList")
	.get(FetchController.GetInsurance);

// Check User
// 26-10-2021 Prayag
router
	.route("/checkUser")
	.get(FetchController.GetUser);

// Get Email's Hospitals
// 28-2-2022 Prayag
router
	.route("/getReporterHospitals")
	.get(FetchController.HospitalReporter);

// Get Jira Reporter
// 15-3-2022 Sampat
router
	.route("/viewreporterlist")
    	.get(FetchController.ViewReporterList);

// Get Claim
// 15-3-2022 Sampat
router
    .route("/dasboardjiralist")
    .get(FetchController.DasboardJiraList);


module.exports = router;
