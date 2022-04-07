const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let roomsschema = new Schema({
    type: {
        type: String,
    },
    no: {
        type: Number,
    },
})


let bankschema = new Schema({
    account_no: {
        type: Number,
    },
    ifsc_code: {
        type: String,
    },
    bank_name: {
        type: String,
    },
    payee_name: {
        type: String,
    },
    pan: {
        type: String,
    },
})

let pocschema = new Schema({
    type: {
        type: String,
    },
    contact: {
        type: Number,
    },
    email: {
        type: String,
    },
    name: {
        type: String,
    },
})

let NewHospitalDetails = new Schema({
    name: {
        type: String,
    },

    ownership: {
        type: String,
    },
    type: {
        type: String,
    },
    accreditation: {
        type: String,
    },
    registration_no: {
        type: String,
    },
    tagline: {
        type: String,
    },
    about: {
        type: String,
    },
    address: {
        type: String,
    },
    logo: {
        type: String,
    },
    city: {
        type: String,
    },
    area: {
        type: String,
    },
    pincode: {
        type: Number,
    },
    district: {
        type: String,
    },
    state: {
        type: String,
    },
    website: {
        type: String,
    },
    email: {
        type: String,
    },
    latitude: {
        type: String,
    },
    longitude: {
        type: String,
    },
    contact: {
        type: Number,
    },
    insurance_accepted: {
        type: String,
    },
    branches: {
        type: Number,
    },
    beds: {
        type: Number,
    },
    doctors: {
        type: Number,
    },
    staff: {
        type: Number,
    },
    avg_patients: {
        type: Number,
    },
    emergency_service: {
        type: String,
    },
    HID: {
        type: String,
    },
    password: {
        type: String,
    },
    icu_beds: {
        type: Number,
    },
    ventilator_beds: {
        type: Number,
    },
    medical_tourism_accepted: {
        type: String,
    },
    tv_installed: {
        type: String,
    },
    rohini_id: {
        type: String,
    },
    specialties: {
        type: Array,
        default: [],
    },
    facilities: {
        type: Array,
        default: [],
    },
    ayush: {
        type: Array,
        default: [],
    },
    rooms: [roomsschema],
    poc: [pocschema],
    bank_details: [bankschema],
    tpa: {
        type: Array,
        default: [],
    },
    insurance: {
        type: Array,
        default: [],
    },
    discount_rate: {
        type: Number,
    },
    referral_rate: {
        type: Number,
    },
    medical_tourism_rate: {
        type: Number,
    },
    url: {
        type: String,
    },
    status: {
        type: String,
    },
    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'hospitals'
    })

module.exports = mongoose.model('NewHospitalDetails', NewHospitalDetails)