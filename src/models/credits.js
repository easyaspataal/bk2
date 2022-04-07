const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let creditsschema = new Schema({
	type: {
		type: String,
	},
	ID: {
		type: Number,
	},
	amount: {
		type: Number,
	},
	start: {
		type: String,
	},
	end: {
		type: String,
	},
	emi: {
		type: Number,
	},
	status: {
		type: String,
	},
})


let Credits = new Schema({
    EID: {
        type: String,
    },
    cover_amount: {
        type: Number,
    },
    status: {
        type: String,
    },
    credits: [creditsschema],

    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'credits'
    })

module.exports = mongoose.model('Credits', Credits)