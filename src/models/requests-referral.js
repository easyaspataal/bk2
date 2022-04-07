const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RequestReferral = new Schema({
    from: {
        type: String,
    },
    EID: {
        type: String, 
    },
    referral_name: {
        type: String,
    },
    for: {
        type: String,
    },
    type: {
        type: String,
    },
    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'requests_referral'
    })

module.exports = mongoose.model('RequestReferral', RequestReferral)