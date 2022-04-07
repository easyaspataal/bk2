const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Agents = new Schema({
    name: {
        type: String,
    },
    contact: {
        type: Number,
    },
    email: {
        type: String,
    },
    city: {
        type: String,
    },
    AID: {
        type: String,
    },
    password: {
        type: String,
    },

    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'agents'
    })

module.exports = mongoose.model('Agents', Agents)