/* ------------------------------------------------------------------------------------------------------------------ */
/*                                       Routes Related To Onboarding Hospitals                                       */
/* ------------------------------------------------------------------------------------------------------------------ */

const express = require("express");
const Hospital = require("../../../models/hospitals/onboarding_hospitals_model");
const router = require("express-promise-router")();
const preboardingController = require("../controllers/preboard_controller");
const { validateBody, schemas } = require("../helpers/validation_helper");

//This route is to post the hospital info and save it to hosp_temp_table
router
	.route("/preboard/register")
	.post(
		validateBody(schemas.hospitalInfo),
		preboardingController.preboardRegister
	);

router
	.route("/preboard/signin")
	.post(
		validateBody(schemas.hospitalSignin),
		preboardingController.preboardSignIn
	);

router
	.route("/preboard/forgotpassword")
	.post(preboardingController.forgotpassword);

router
	.route("/preboard/resetpassword")
	.put(preboardingController.resetpassword);

// OnBoarding Hospital
// Created : 26-4-2021 Prayag
router
	.route("/onboardhospital")
	.post(preboardingController.OnBoardHospital);


// OnBoarding Hospital from Excel
// Created : 26-4-2021 Prayag
router
	.route("/onboardhospitalexcel")
	.post(preboardingController.OnBoardHospitalExcel);

module.exports = router;
