const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let patientinfoSchema = new Schema({
	user_id: {
		type: Schema.Types.ObjectId,
	},
	name: {
		type: String,
	},
	gender: {
		type: String,
	},
	email: {
		type: String,
		lowercase: true,
	},
	mobile: {
		type: Number,
	},
	age: {
		type: Number,
	},
	aadhar_no: {
		type: Number,
		default: '',
	},
	relation_with_user: {
		type: String,
	},
	created_date : { type : Date, default: Date.now },
	
	modified_date : { type : Date, default: Date.now },

}, 

{
        collection: 'patient_info'
    })

module.exports = mongoose.model('Patient', patientinfoSchema)