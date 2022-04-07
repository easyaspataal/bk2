const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const specialities = new Schema({
	specialityId: Number,
	specialityName: String,
});

// Create a model.
/*
Structure - mongoose.model((unique name of schema), (schema to be used), (Collection name which will appear in mongodb) )
*/
const Specialities = mongoose.model(
	"Specialities",
	specialities,
	"master_specialities"
);

module.exports = Specialities;
