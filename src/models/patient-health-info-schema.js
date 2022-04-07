const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let patienthealthinfoSchema = new Schema({
	patient_id: {
		type: Schema.Types.ObjectId,
	},
	purpose_of_visit: {
		type: String,
	},
	illness: {
		type: String,
	},
	created_date : { type : Date, default: Date.now },
	
	modified_date : { type : Date, default: Date.now },

}, 

{
        collection: 'patient_health_info'
    })

module.exports = mongoose.model('PatientHealth', patienthealthinfoSchema)