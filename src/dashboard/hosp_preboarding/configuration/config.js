/* ------------------------------------------------------------------------------------------------------------------ */
/*                                           This File Contains All The Keys                                          */
/* ------------------------------------------------------------------------------------------------------------------ */
const { Keys } = require("../../../configuration/config");

module.exports = {
	Keys: {
		EXPRESS_SESSION_SECRET: Keys.EXPRESS_SECRET,
		FRONTEND_REDIRECT_URL: Keys.FRONTEND_REDIRECT_URL,
		MongodbURI: Keys.MongodbURI,
		JWT_SECRET: Keys.JWT_SECRET,
		HOSPITAL_ID_TRACKER: Keys.HOSPITAL_ID_TRACKER,
		PlacesApi: Keys.PlacesApi,
	},
};
