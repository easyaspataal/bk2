const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Corporate = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    mobile: {
        type: Number,
    },
    company_name: {
        type: String,
    },
    password: {
        type: String,
    },
    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'corporates'
    })

module.exports = mongoose.model('Corporate', Corporate)