const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingStatusSchema = new Schema({
	bookingId: {
		type: Schema.Types.ObjectId,
	},
	hospitalId: {
		type: Schema.Types.ObjectId,
	},
	bookingStatus: {
		type: String,
		enum: [
			"BOOKING_REQUEST_TO_HOSPITAL",
			"BOOKING_REQUEST_SEEN",
			"DEPOSIT_CHARGES_PENDING",
			"BOOKING_REQUEST_DENIED",
			"BOOKING_CANCELLED",
			"PAYMENT_SUCCESS",
			"PAYMENT_FAILED",
			"BOOKING_CONFIRMED",
		],
	},
	statusUpdateTime: {
		type: Number,
	},
	metadata: {
		type: Array,
	},
	history: [
		{
			bookingStatus: String,
			metadata: {
				type: Array,
			},
			statusUpdateTime: Number,
		},
	],
});

const patientBookingStatus = mongoose.model(
	"Patient_orders",
	bookingStatusSchema,
	"Booking_Status_Table"
);

module.exports = patientBookingStatus;
