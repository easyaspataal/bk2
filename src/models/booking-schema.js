const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let bookingSchema = new Schema({
	patient_id: {
		type: Schema.Types.ObjectId,
	},

	hospital_id: {
		type: Schema.Types.ObjectId,
	},

    booking_status: {
        type: String,
        default: 'Pending'
    },

    booking_date: {
        type: Date,
    },    

	booking_date : { type : Date, default: Date.now },

	created_date : { type : Date, default: Date.now },
	
	modified_date : { type : Date, default: Date.now },
}, 

{
        collection: 'booking_details'
    })

module.exports = mongoose.model('BookingDetails', bookingSchema)