const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RequestSurgery = new Schema({
    from: {
        type: String,
    },
    EID: {
        type: String,
    },
    surgery: {
        type: String,
    },
    estimated_cost: {
        type: Number,
    },
    hospital_name: {
        type: String,
    },
    hospital_contact: {
        type: Number,
    },
    hospital_pincode: {
        type: Number,
    },
    ID: {
        type: Number,
    },
    type: {
        type: String,
    },
    finance: {
        type: Boolean,
    },
    insurance: {
        type: Boolean,
    },
    status: {
        type: String,
    },
    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'requests_surgery'
    })

module.exports = mongoose.model('RequestSurgery', RequestSurgery)
