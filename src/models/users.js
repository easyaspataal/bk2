const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let relationschema = new Schema({
	EID: {
		type: String,
	},
	relation: {
		type: String,
	},
})

let Users = new Schema({
    name: {
        type: String,
        default: '',
    },
    gender: {
        type: String,
        default: '',
    },
    mobile: {
        type: Number,
    },
    cmobile: {
        type: Number,
    },
    corporate_id: {
        type: Schema.Types.ObjectId,
    },
    age: {
        type: Number,
        default: '',
    },
    dob: {
        type: String,
        default: '',
    },
    cemail: {
        type: String,
    },
    email: {
        type: String,
        default: '',
    },
    EID: {
        type: String,
    },
    address_area: {
        type: String,
    },
    from: {
        type: String,
    },
    marital_status: {
        type: String,
    },
    father_name: {
        type: String,
    },
    relation: {
        type: String,
    },
    otp_verified: {
        type: Boolean
    },
    kyc_verified: {
        type: Boolean
    },
    mother_name: {
        type: String,
    },
    address_line1: {
        type: String,
    },
    address_line2: {
        type: String,
    },
    pincode: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    relations: [relationschema],

    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'users'
    })

module.exports = mongoose.model('Users', Users)