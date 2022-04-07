const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const leegalityResponseSchema = new Schema({
	responseData: {
		type: Object,
	},
	time: {
		type: Number,
	},
	irn: {
        type : String,
    }
});
const leegalityResponseModel = mongoose.model("Leegality_response_collection", leegalityResponseSchema, "Leegality_response");

module.exports = leegalityResponseModel;
