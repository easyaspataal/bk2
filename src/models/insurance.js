const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let NewInsuranceSchema = new Schema({
    sr_no: {
        type: Number,
    },
    insurer: {
        type: String,
    },
    registered_address: {
        type: String,
    },
    ceo: {
        type: String,
    },
    appointed_actuary: {
        type: String,
    },
    phone_no: {
        type: String,
    },
    website: {
        type: String,
    },
    workflow_id: {
        type: String,
    },
    faxNumber: {
        type: String,
    },
    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},
    {
        collection: 'insurance'
    })

module.exports = mongoose.model('NewInsuranceSchema', NewInsuranceSchema)