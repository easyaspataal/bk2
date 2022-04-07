const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const emailSchema = new Schema({
	emailType: {
		type: String,
	},
	template: {
		type: String,
	},
});

const EmailTemplate = mongoose.model(
	"EmailTemplates",
	emailSchema,
	"Email_Templates"
);

// Export the model
module.exports = EmailTemplate;
