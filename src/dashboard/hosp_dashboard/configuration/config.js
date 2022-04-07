const { Keys } = require("../../../configuration/config");

module.exports = {
	Keys: {
		EXPRESS_SESSION_SECRET: Keys.EXPRESS_SECRET,
		MongodbURI: Keys.MongodbURI,
		JWT_SECRET: Keys.JWT_SECRET,
	},
};
