const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let hospitalBillingSchema = new Schema({
    hospital_id: {
        type: Schema.Types.ObjectId,
    },
    services: {
    }
}, 

{
        collection: 'master_hospital'
    })

module.exports = mongoose.model('HospitalBillingDetails', hospitalBillingSchema)