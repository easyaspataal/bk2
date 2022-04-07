const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
	createdBy: {
		type: Schema.Types.ObjectId,
	},
	patientId: {
		type: Schema.Types.ObjectId,
	},
	historyId: {
		type: Schema.Types.ObjectId,
	},
	hospitalId: {
		type: Schema.Types.ObjectId,
	},
	hospitalName: {
		type: String,
	},
	hospitalBedCategoryId: {
		type: Schema.Types.ObjectId,
	},
	dateOfBooking: {
		type: Date,
	},
	bookingTime: {
		type: Number,
	},
	isDraft: {
		type: Boolean,
	},
	purposeOfVisit: {
		type: String,
	},
	currentIllness: {
		type: String,
	},
	illnessHistory: {
		type: Array,
		default: [],
	},
	additionalDetails: {
		type: String,
		default: "",
	},
	medicalConditions: {
		type: Array,
		default: [],
	},
	symptoms: {
		type: Array,
		default: [],
	},
	isMedication: {
		type: Boolean,
	},
	medications: {
		type: String,
	},
	recommender: {
		firstName: String,
		lastName: String,
	},
	recommenderPlaceType: {
		type: String,
	},
	insurance: {
		name: String,
		number: String,
		document: String,
	},
	relatedDocuments: [
		{
			title: String,
			purpose: String,
			date: String,
			docType: String,
			fileurl: String,
		},
	],
	workflowId:String,
	paidByInsurance:{
		type: Boolean
	},
	leegalityData:{
		documentId : String,
		documentName : String,
		irn: String,
		status :{
					type : String, 
					enum:['COMPLETED','EXPIRED','INITIATED','REJECTED','REINITIATED']
				},
		auditTrailURL : String,
		signedDocumentURL: Array
	}
});

const Bookings = mongoose.model(
	"Patient_bookings",
	bookingSchema,
	"Booking_Table"
);

module.exports = Bookings;
