/* ----------------- This File Sets Up The Routes Used For Server Sent Events On Hospital Dashboards ----------------- */

/* -------------------------------------------------- Requirements -------------------------------------------------- */

const router = require("express-promise-router")();
const fetchbookingrequests = require("../controllers/fetch_booking_requests");
const SaveDetails = require("../controllers/savedetails");
/* ------------------------------------------------------------------------------------------------------------------ */

//This route gives the booking updates to hospitals' dashboard.
router
	.route("/fetchbookingrequests")
	.get(fetchbookingrequests.fetchBookingInfo);

router
	.route("/fetchSelectedPatientDetails")
	.get(fetchbookingrequests.fetchSelectedPatientInfo);

router
	.route("/EditPatientUpdate")
	.get(fetchbookingrequests.UpdatePatientDetails);

router
	.route("/hospitalbillingdata")
	.get(fetchbookingrequests.fetchPatientBillingData);

// Billing Details
// 15-3-2021 Prayag
router
	.route("/fetchbillingdetails")
	.get(fetchbookingrequests.fetchBillingData);

// Hospital OPD Details
// 6-4-2021 Prayag
router
	.route("/fetchhospitalopd")
	.get(fetchbookingrequests.fetchHospitalData);

// Hospital OPD Details
// 7-4-2021 Prayag
router
	.route("/saveopd")
	.post(SaveDetails.SaveOPD);

module.exports = router;
