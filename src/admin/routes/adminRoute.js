/* ----------------- This File Sets Up The Routes Used For Server Sent Events On Admin ----------------- */
// Created : 9-4-2021 by Prayag
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const router = require("express-promise-router")();
const SaveController = require("../controllers/SaveData");
const FetchController = require("../controllers/FetchDetails");
/* ------------------------------------------------------------------------------------------------------------------ */


// Admin Login
// 9-4-2021 Prayag
router
	.route("/login")
	.post(FetchController.Login);

// Save Uploaded Files
// 9-4-2021 Prayag
router
	.route("/uploadfiles")
	.post(SaveController.Uploads);

// Fetch Easy Loan Data
// 12-4-2021 Prayag
router
	.route("/fetcheasyloandetails")
	.get(FetchController.EasyLoan);

// Update Easy Loan Status
// 17-4-2021 Prayag
router
	.route("/updateloanstatus")
	.post(SaveController.UpdateLoanStatus);

// Upload Hospital Excel
// 27-4-2021 Prayag
router
	.route("/uploadexcel")
	.post(SaveController.UploadExcel);

// Fetch Hospitals
// 6-5-2021 Prayag
router
	.route("/fetchhospitals")
	.get(FetchController.HospitalListing);

// Save Hospital from Form
// 8-5-2021 Prayag
router
	.route("/savehospital")
	.post(SaveController.OnBoardHospital);

// Delete Hospital
// 21-5-2021 Prayag
router
	.route("/deletehospital")
	.post(SaveController.DeleteHospital);

// Get Selected Hospital Detail
// 29-5-2021 Prayag
router
	.route("/selectedhospital")
	.get(FetchController.SelectedHospital);

// Edit Hospital
// 26-5-2021 Prayag
router
	.route("/edithospital")
	.post(SaveController.EditHospital);

// Delete Image
// 28-5-2021 Prayag
router
	.route("/deleteimage")
	.post(SaveController.DeleteImage);

// Update Logo
// 28-5-2021 Prayag
router
	.route("/updatelogo")
	.post(SaveController.UpdateLogo);

// Fetch Corporates
// 7-6-2021 Prayag
router
	.route("/fetchcorporates")
	.get(FetchController.CorporateListing);

// Fetch Selected Corporate
// 11-6-2021 Prayag
router
	.route("/selectedCorporate")
	.get(FetchController.SelectedCorporate);

// Save Vaccination Slots
// 11-6-2021 Prayag
router
	.route("/saveVaccinationSlots")
	.post(SaveController.SaveVaccinationSlots);

// Send Vaccination Notifications
// 11-6-2021 Prayag
router
	.route("/sendVaccinationNotifications")
	.post(SaveController.SendVaccinationNotifications);

// Fetch Leads
// 23-9-2021 Prayag
router
	.route("/fetchleadlist")
	.get(FetchController.LeadsListing);

// Fetch Selected Corporate
// 11-6-2021 Prayag
router
	.route("/selectedLeads")
	.get(FetchController.SelectedLead);

// Save QR
// 10-12-2021 Sampat
router
	.route("/qruploadfiles")
	.post(SaveController.UploadQr);

router
    .route("/agreementjirastatus")
    .post(SaveController.AgreementJiraStatus);

// Jira Bitly
// 22-3-2021 Sampat
router
	.route("/bitlyjira")
	.post(SaveController.BitlyJira);

// Cibil Score
// 23-3-2021 Sampat
router
    .route("/getequifax")
    .all(FetchController.Getequifax);

// Jira Contact Verify
// 2-5-2021 Sampat
router
    .route("/jiracontactverify")
    .put(SaveController.jiraContactVerify);

router
    .route("/bitlyjiraatl")
    .post(SaveController.BitlyJiraAtl);

router
    .route("/jiraemailverify")
    .put(SaveController.jiraEmailVerify);

router
    .route("/emailotp")
    .post(SaveController.Emailotp);

router
    .route("/wixjiraonboarding")
    .post(SaveController.WixJiraOnboarding);

router
    .route("/bitlyjiraonboard")
    .post(SaveController.BitlyJiraOnboard);

module.exports = router;
