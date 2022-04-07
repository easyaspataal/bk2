const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let particularschema = new Schema({
	service_id: {
		type: Schema.Types.ObjectId,
	},
	quantity: {
		type: Number,
	},
	rate: {
		type: Number,
	},
})

let billingSchema = new Schema({
	booking_id: {
		type: Schema.Types.ObjectId,
	},

	particulars: [particularschema],

	invoice_no: {
		type: Number
	},

	final: {
		type: String
	},

created_date: { type: Date, default: Date.now },

modified_date: { type: Date, default: Date.now },

},

{
	collection: 'billing_details'
})

module.exports = mongoose.model('Billing', billingSchema)