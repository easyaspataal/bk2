const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RequestEasyLoan = new Schema({
    from: {
        type: String,
    },
    EID: {
        type: String,
    },
    surgery: {
        type: String,
    },
    loan_required: {
        type: Number,
    },
    budget: {
        type: Number,
    },
    status: {
        type: String,
    },
    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'requests_easyloan'
    })

module.exports = mongoose.model('RequestEasyLoan', RequestEasyLoan)