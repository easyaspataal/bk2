const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RequestEstimation = new Schema({
    from: {
        type: String,
    },
    EID: {
        type: String, 
    },
    treatment: {
        type: String,
    },
    budget: {
        type: Number,
    },
    city: {
        type: String,
    },
    finance: {
        type: String,
    },
    insurance: {
        type: String,
    },
    status: {
        type: String,
    },
    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'requests_estimation'
    })

module.exports = mongoose.model('RequestEstimation', RequestEstimation)
