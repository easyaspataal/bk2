const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cityschema = new Schema({
	city: {
		type: String,
	},
	latitude: {
		type: String,
	},
	longitude: {
		type: String,
	},
});

const Cities = mongoose.model("SearchCitySchema", cityschema, "master_cities");

module.exports = Cities;
