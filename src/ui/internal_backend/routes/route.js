/* ----------------- This File Sets Up The Routes Used For Internal Purpose ----------------- */

/* -------------------------------------------------- Requirements -------------------------------------------------- */
const router = require("express-promise-router")();
const SaveController = require("../controllers/SaveData");
const FetchController = require("../controllers/FetchDetails");
/* ------------------------------------------------------------------------------------------------------------------ */


// Get internal leads (postgres)
// 13-7-2022 Sampat
router
	.route("/getinternaleads")
	.get(FetchController.GetInternalLeads);

// Get single internal lead (postgres)
// 13-7-2022 Sampat
router
	.route("/getsingleinternaleads")
	.get(FetchController.GetSingleInternalLead);    

// Save internal leads (postgres)
// 13-7-2022 Sampat
router
	.route("/saveinternaleads")
	.all(SaveController.SaveInternalLeads);    
	
        
module.exports = router;
