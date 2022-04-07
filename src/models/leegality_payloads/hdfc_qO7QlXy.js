const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const payloadSchema = new Schema({
	payload: {
		type: Object,
	},
	time: {
		type: Number,
	},
	documentId: {
		type : String
	},
	bookingId : {
		type: String
	},
	irn : {
		type :String
	},
	status : {
		type : String,
		enum : ['COMPLETED','EXPIRED','REJECTED']
	}
});
const hdfcModel = mongoose.model("HDFC_qO7QlXy", payloadSchema, "HDFC_qO7QlXy");

module.exports = hdfcModel;
