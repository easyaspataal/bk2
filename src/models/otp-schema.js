const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OTPDetails = new Schema({
	mobile: {
		type: Number,
	},
	verified: {
		type: String,
	},
	created_date : { type : Date, default: Date.now },
	
	modified_date : { type : Date, default: Date.now },
}, 

{
        collection: 'otp_requests'
    })

module.exports = mongoose.model('OTPDetails', OTPDetails)