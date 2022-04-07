const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RequestKYC = new Schema({
    from: {
        type: String,
    },
    EID: {
        type: String,
    },
    pan: {
        type: String,
        default: '',
    },
    pan_img: {
        type: String,
        default: '',
    },
    tax_img: {
        type: String,
        default: '',
    },
    aadhar_no: {
        type: Number,
        default: '',
    },
    aadhar_img: {
        type: String,
        default: '',
    },
    bank_img: {
        type: String,
        default: '',
    },
    others: {
        type: Array,
    },
    status: {
        type: String,
    },
    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'requests_kyc'
    })

module.exports = mongoose.model('RequestKYC', RequestKYC)