/* ------------------------------------------------------------------------------------------------------------------ */
/*                           This File Containes The Route Used To Search For The Hospitals                           */
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Requirements -------------------------------------------------- */

const express = require("express");
const router = require("express-promise-router")();
const SearchByLocationController = require("../../../controllers/hospitalSearch");

/* ------------------------------------------------------------------------------------------------------------------ */

router
	.route("/searchbylocation")
	.post(SearchByLocationController.searchbylocation);

router.route("/searchbyname").get(SearchByLocationController.searchByName);

// Selected Hospital Data
// 13-4-2021 Prayag
router.route("/selectedhospital").get(SearchByLocationController.SelectedHospital);

module.exports = router;
