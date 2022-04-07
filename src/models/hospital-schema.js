const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let hospitalSchema = new Schema({
    email: {
        type: String,
    },
    password: {
        type: String,
    }
}, 

{
        collection: 'hospital_details'
    })

module.exports = mongoose.model('HospitalDetails', hospitalSchema)