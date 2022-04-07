const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let paymentSchema = new Schema({
	patient_id: {
		type: Schema.Types.ObjectId,
	},
	type: {
		type: String,
	},
	deposit_amount: {
		type: Number,
	},	
	status: {
		type: String,
	},
	created_date : { type : Date, default: Date.now },
	
	modified_date : { type : Date, default: Date.now },

}, 

{
        collection: 'payment_details'
    })

module.exports = mongoose.model('Payment', paymentSchema)