const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Rohini = new Schema({
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    rohini_id: {
        type: Number,
    },
    email: {
        type: String,
    },
    contact: {
        type: String,
    },
    state: {
        type: String,
    },
    district: {
        type: String,
    },
    city: {
        type: String,
    },
    pincode: {
        type: String,
    },
    no_of_beds: {
        type: String,
    },
    latitude: {
        type: String,
    },
    longitude: {
        type: String,
    },
    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'rohini'
    })

module.exports = mongoose.model('Rohini', Rohini)