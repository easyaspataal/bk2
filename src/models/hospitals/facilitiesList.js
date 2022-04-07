const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const facilities = new Schema({
	facilityId: Number,
	facilityName: String,
});

// Create a model.
/*
Structure - mongoose.model((unique name of schema), (schema to be used), (Collection name which will appear in mongodb) )
*/
const Facilities = mongoose.model("Facilities", facilities, "master_facilities");

module.exports = Facilities;
