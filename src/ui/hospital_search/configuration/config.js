/*
 ************************************************************************************************
 ************************     This file should containes all the keys     ************************
 ************************   This file should not be uploaded anywhere   *************************
 ************************************************************************************************
 */

const { Keys } = require("../../../configuration/config");

module.exports = {
	Keys: {
		EXPRESS_SESSION_SECRET: Keys.EXPRESS_SECRET,
		FRONTEND_REDIRECT_URL: Keys.FRONTEND_REDIRECT_URL,
		PlacesApi: Keys.PlacesApi,
		MongodbURI: Keys.MongodbURI,
		DEFAULT_UNVERIFIED_HOSPITAL_LOGO: Keys.DEFAULT_UNVERIFIED_HOSPITAL_LOGO,
	},
};
