const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const admissionFormSchema = new Schema({
	bedCategoryId: {
		type: Schema.Types.ObjectId,
	},
	patientId: {
		type: Schema.Types.ObjectId,
	},
	bookingId: {
		type: Schema.Types.ObjectId,
	},
	hospitalId: {
		type: Schema.Types.ObjectId,
	},
	patientFullName: String,
	dateOfBirth: String,
	gender: String,
	email: String,
	phone: String,
	address: String,
	admissionDate: Date,
	referredBy: String,
	relativeName: String,
	relativePhone: String,
	witness: String,
});

const admissionForms = mongoose.model(
	"Admission_Form",
	admissionFormSchema,
	"Admission_Forms"
);

module.exports = admissionForms;
