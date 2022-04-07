/* ----------------- This File Sets Up The Routes Used For Corporate ----------------- */
// Created : 1-6-2021 by Prayag
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const router = require("express-promise-router")();
const SaveController = require("../controllers/SaveData");
const FetchController = require("../controllers/FetchDetails");
/* ------------------------------------------------------------------------------------------------------------------ */


// Send OTP SMS
// 1-6-2021 Prayag
router
    .route("/sendotp")
    .post(SaveController.SendOTP);

// Save Corporate
// 1-6-2021 Prayag
router
    .route("/savecorporate")
    .post(SaveController.OnboardCorporate);

// Login Corporate
// 4-6-2021 Prayag
router
    .route("/corporateLogin")
    .post(FetchController.Login);

// Get Logged in User Details
// 10-6-2021 Prayag
router
    .route("/getUser")
    .get(FetchController.getUser);

// Save & Onboard User
// 10-6-2021 Prayag
router
    .route("/onboardUser")
    .post(SaveController.SaveUser);

// Get Logged in Corporate Details
// 11-6-2021 Prayag
router
    .route("/getCorporateData")
    .get(FetchController.getCorporate);

// Edit Corporate
// 16-6-2021 Prayag
router
    .route("/editCorporate")
    .post(SaveController.EditCorporate);

// Corporate Reset Password
// 16-6-2021 Prayag
router
    .route("/passwordResetCorporate")
    .post(SaveController.ResetCorporatePassword);

// Corporate Forgot Password
// 5-7-2021 Prayag
router
    .route("/passwordForgotCorporate")
    .post(SaveController.ForgotCorporatePassword);

// Corporate Upload Documents
// 28-6-2021 Prayag
router
    .route("/uploadKYC")
    .post(SaveController.Uploads);

// Corporate Disbursement
// 28-6-2021 Prayag
router
    .route("/saveDisbursement")
    .post(SaveController.SaveDisbursement);

// Corporate Surgery
// 28-6-2021 Prayag
router
    .route("/saveSurgery")
    .post(SaveController.SaveSurgery);

// Corporate EMI
// 30-6-2021 Prayag
router
    .route("/saveEMI")
    .post(SaveController.SaveEMI);

// Get User Requests Details
// 30-6-2021 Prayag
router
    .route("/getUserRequests")
    .get(FetchController.getUserRequests);

// Corporate Dependent
// 15-7-2021 Prayag
router
    .route("/saveDependent")
    .post(SaveController.SaveDependent);

// Corporate Excel Upload
// 16-7-2021 Prayag
router
    .route("/saveExcel")
    .post(SaveController.UploadExcel);

// Get Credits Data
// 16-7-2021 Prayag
router
    .route("/getUserCredits")
    .get(FetchController.UserCredits);

// Corporate Edit Dependent
// 19-7-2021 Prayag
router
    .route("/editDependent")
    .post(SaveController.EditDependent);

// Corporate Delete Dependent
// 19-7-2021 Prayag
router
    .route("/deleteDependent")
    .post(SaveController.DeleteDependent);

// Corporate Activate Card
// 26-7-2021 Prayag
router
    .route("/activateCredit")
    .post(SaveController.ActivateCredit);

// Corporate Vaccination Details
// 28-7-2021 Prayag
router
    .route("/getUserVaccinationData")
    .get(FetchController.UserVaccinationData);

// Corporate Dependent Details
// 28-7-2021 Prayag
router
    .route("/getUserDependentData")
    .get(FetchController.UserDependentData);

// Corporate Vaccination Details
// 28-7-2021 Prayag
router
    .route("/getUserKYCData")
    .get(FetchController.UserKYCData);

// Save Retail Disbursement Details
// 31-7-2021 Prayag
router
    .route("/saveRetailDisbursement")
    .post(SaveController.SaveRetailDisbursement);

// Send Query
// 7-8-2021 Prayag
router
    .route("/sendQuery")
    .post(SaveController.SendQuery);

module.exports = router;
