/* ------------------------------------------------------------------------------------------------------------------ */
/*                                          This File Sets Up The User Schema                                         */
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Requirements -------------------------------------------------- */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* ------------------------------------------------------------------------------------------------------------------ */

// Create the User Schema

const hospEnquiry = new Schema({
	name: String,
	hospName: String,
	city: String,
	email: String,
	phone: String,
});

// Create a model.
/*
Structure - mongoose.model((unique name of schema), (schema to be used), (Collection name which will appear in mongodb) )
*/
const hospEnquirySchema = mongoose.model(
	"Hospital_SignUp_List",
	hospEnquiry,
	"hospital_signup_list"
);

// Export the model
module.exports = hospEnquirySchema;
