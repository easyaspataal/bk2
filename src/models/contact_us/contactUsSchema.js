const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactUsSchema = new Schema({
	name: String,
	phoneOrEmail: String,
	query: String,
});
const contactUsModel = mongoose.model(
	"contactUs_table",
	contactUsSchema,
	"ContactUs_Table"
);

module.exports = contactUsModel;
