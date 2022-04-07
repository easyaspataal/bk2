const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentsSchema = new Schema({
	bookingId: {
		type: Schema.Types.ObjectId,
	},
	details: {
		type: Object,
	},
	lastPaymentsUpdate: {
		type: Number,
	},
	paidByInsurance:{
		type: Boolean
	}
});

const patientPayments = mongoose.model(
	"Patient_payments",
	paymentsSchema,
	"Payments_Table"
);

module.exports = patientPayments;
