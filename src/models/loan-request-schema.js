const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let EasyLoanSchema = new Schema({
	patient_id: {
		type: Schema.Types.ObjectId,
	},
	loan_amount: {
		type: Number,
	},
	reason: {
		type: String,
	},
	pincode: {
		type: Number,
	},
	status: {
		type: String,
	},
	from: {
		type: String,
	},
	
	created_date : { type : Date, default: Date.now },
	
	modified_date : { type : Date, default: Date.now },

}, 

{
        collection: 'easy_loan_requests'
    })

module.exports = mongoose.model('EasyLoan', EasyLoanSchema)