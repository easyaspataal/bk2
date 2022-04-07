const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const availInsuranceSchema = new Schema({
	patientId: {
		type: Schema.Types.ObjectId,
	},
	userId: {
		type: Schema.Types.ObjectId,
	},
	patientName: String,
	email: String,
	phone: String,
	dateOfBirth: Date,
});
const availInsuranceModel = mongoose.model(
	"avail_Insurance",
	availInsuranceSchema,
	"Avail-Insurance"
);

module.exports = availInsuranceModel;
