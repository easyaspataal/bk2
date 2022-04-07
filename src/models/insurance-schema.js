const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let insuranceSchema = new Schema({
	name: {
		type: String,
	},
	insurance_number: {
		type: Number,
		default: '',
	},
	patient_id: {
		type: Schema.Types.ObjectId,
	},
	approval: {
		type: String,
		default: 'Pending',
	},
	validity: {
		type: String,
		default: '',
	},
	
	created_date : { type : Date, default: Date.now },
	
	modified_date : { type : Date, default: Date.now },

}, 

{
        collection: 'insurance_details'
    })

module.exports = mongoose.model('Insurance', insuranceSchema)