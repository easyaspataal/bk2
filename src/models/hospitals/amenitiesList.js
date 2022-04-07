const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const amenities = new Schema({
	amenityId: Number,
	amenityName: String,
	amenityIconUrl: String,
});

const Amenities = mongoose.model("Amenities", amenities, "master_amenities");

module.exports = Amenities;
