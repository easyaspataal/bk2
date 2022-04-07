const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let slotsschema = new Schema({
	date: {
		type: String,
	},
	start_time: {
		type: String,
	},
	end_time: {
		type: String,
	},
	start_range: {
		type: String,
	},
	end_range: {
		type: String,
	},
})


let RequestVaccination = new Schema({
    corporate_id: {
        type: Schema.Types.ObjectId,
    },
    from: {
        type: String,
    },
    origin: {
        type: String,
    },
    enrolled: {
        type: Number,
    },
    venue_address1: {
        type: String,
    },
    venue_address2: {
        type: String,
    },
    venue_pincode: {
        type: Number,
    },
    status: {
        type: String,
    },
    slots: [slotsschema],
    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'requests_vaccination'
    })

module.exports = mongoose.model('RequestVaccination', RequestVaccination)