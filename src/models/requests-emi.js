const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RequestHealthCover = new Schema({
    from: {
        type: String,
    },
    EID: {
        type: String,
    },
    total_amount: {
        type: String,
    },
    tenure_in_months: {
        type: String,
    },
    expiry_date: {
        type: String,
    },
    emi_amount: {
        type: String,
    },
    status: {
        type: String,
    },
    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'requests_emi'
    })

module.exports = mongoose.model('RequestHealthCover', RequestHealthCover)