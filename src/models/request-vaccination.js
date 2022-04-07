const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RequestVaccination = new Schema({
    corporate_id: {
        type: Schema.Types.ObjectId,
    },
    from: {
        type: String,
    },
    origin: {
        type: String,
    },
    enrolled: {
        type: Number,
    },
    venue: {
        type: String,
    },
    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'requests_vaccination'
    })

module.exports = mongoose.model('RequestVaccination', RequestVaccination)