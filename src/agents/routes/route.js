/* ----------------- This File Sets Up The Routes Used For Agents ----------------- */
/* ----------------------------------- Created : 10-8-2021 by Prayag -------------------------------------------------- */
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const router = require("express-promise-router")();
const SaveController = require("../controllers/SaveData");
const FetchController = require("../controllers/FetchDetails");
/* ------------------------------------------------------------------------------------------------------------------ */


// Login
// 10-8-2021 Prayag
router
    .route("/login")
    .post(SaveController.Login);

// Save Leads
// 10-8-2021 Prayag
router
    .route("/saveLead")
    .post(SaveController.LeadSave);

// Agent Leads List
// 10-8-2021 Prayag
router
    .route("/getLeads")
    .get(FetchController.LeadListing);

module.exports = router;
