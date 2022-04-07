const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let requestsSchema = new Schema({
	name: {
		type: String,
	},
	mobile: {
		type: String,
	},
	pincode: {
		type: String,
	},
	type: {
		type: String,
	},
	amount: {
		type: Number,
		default: ''
	},
	reason: {
		type: String,
		default: ''
	},
	age: {
		type: Number,
		default: ''
	},
	for: {
		type: String,
		default: ''
	},
	surgery: {
		type: String,
		default: ''
	},
	treatment: {
		type: String,
		default: ''
	},
	referal: {
		type: String,
		default: ''
	},
	insurance: {
		type: String,
		default: ''
	},
	insuranceamount: {
		type: Number,
		default: ''
	},
	surgerydate: {
		type: Date,
		default: ''
	},
	doctorname: {
		type: String,
		default: ''
	},
	status: {
		type: String,
		default: ''
	},
	from: {
		type: String,
		default: ''
	},

	created_date : { type : Date, default: Date.now },
	
	modified_date : { type : Date, default: Date.now },
}, 

{
        collection: 'requests'
    })

module.exports = mongoose.model('RequestsDetails', requestsSchema)