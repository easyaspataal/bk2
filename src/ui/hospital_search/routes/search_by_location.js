/* ------------------------------------------------------------------------------------------------------------------ */
/*                           This File Containes The Route Used To Search For The Hospitals                           */
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Requirements -------------------------------------------------- */

const express = require("express");
const router = require("express-promise-router")();
const SearchByLocationController = require("../controllers/hospitalSearch");
const SaveController = require("../controllers/savepatient");

/* ------------------------------------------------------------------------------------------------------------------ */

router
	.route("/searchbylocation")
	.post(SearchByLocationController.searchbylocation);

router.route("/searchbyname").get(SearchByLocationController.searchByName);

// Selected Hospital Data
// 13-4-2021 Prayag
router.route("/selectedhospital").get(SearchByLocationController.SelectedHospital);

// Get all Filters
// 1-5-2021 Prayag
router.route("/getallfilters").get(SearchByLocationController.GetAllFilters);

// Get all Filters
// 2-5-2021 Prayag
router.route("/getselectedfilters").post(SearchByLocationController.GetSelectedFilters);

// Get all Cities
// 2-5-2021 Prayag
router.route("/getallcities").get(SearchByLocationController.GetAllCities);

// Save Patient from Checkin
// 11-5-2021 Prayag
router.route("/savepatient").post(SaveController.CreatePatient);


module.exports = router;
