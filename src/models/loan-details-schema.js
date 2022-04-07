const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let goldschema = new Schema({
	pincode: {
		type: Number,
	},
	grams: {
		type: Number,
	},
})

let othersschema = new Schema({
	type: {
		type: String,
	},
	name: {
		type: String,
	},
	quantity: {
		type: Number,
	},
	value: {
		type: Number,
	},
})


let EasyLoanDetailsSchema = new Schema({
	loan_id: {
		type: Schema.Types.ObjectId,
	},
	employement: {
		type: String,
	},
	income_status: {
		type: String,
	},	
	filename: {
		type: String,
	},	
	gold: [goldschema],
	others: [othersschema],
	created_date : { type : Date, default: Date.now },
	
	modified_date : { type : Date, default: Date.now },

}, 

{
        collection: 'easy_loan_details'
    })

module.exports = mongoose.model('EasyLoanDetails', EasyLoanDetailsSchema)