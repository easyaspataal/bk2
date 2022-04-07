/* ------------------------------------------------------------------------------------------------------------------ */
/*                                          This File Sets Up The User Schema                                         */
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Requirements -------------------------------------------------- */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* ------------------------------------------------------------------------------------------------------------------ */

// Create the User Schema

const hospidTracker = new Schema({
	idNumber: Number,
	idType: String,
});

// Create a model.
/*
Structure - mongoose.model((unique name of schema), (schema to be used), (Collection name which will appear in mongodb) )
*/
const Tracker = mongoose.model(
	"HospTracker",
	hospidTracker,
	"hospital_id_tracker"
);

// Export the model
module.exports = Tracker;
