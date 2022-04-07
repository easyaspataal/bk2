const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hospitalSchema = new Schema({
    placeId: String,
    name: String,
    city: String,
    address: String,
    state: String,
    latitude: String,
    longitude: String,
    phone: {
        type: Array,
        default: 'Phone number not available',
    },
    specialities: {
        type: Array,
        default: '',
    },
    visitorExperience: [
        {
            name: String,
            photo: String,
            rating: Number,
            reviewText: String,
        },
    ],
    rating: [
        {
            1: Number,
            2: Number,
            3: Number,
            4: Number,
            5: Number,
        },
    ],
    description: String,
    detailedDescription: String,
    hospitalLogo: String,
    bedsAvailable: Number,
    hospitalDepartment: [
        {
            departmentName: String,
            description: String,
            doctorList: [
                {
                    doctorName: String,
                    image: String,
                    about: String,
                    email: String,
                    phoneNumber: String,
                },
            ],
        },
    ],
    hospitalBed: [
        {
            hospitalID: String,
            bedtype: String,
            facility: {
                type: Array,
            },
            Description: String,
            photo: {
                type: Array,
                default: '',
            },
            price: Number,
        },
    ],
});

const Hospital = mongoose.model(
    'VerifiedHospitalSchema',
    hospitalSchema,
    'Verified-Hospitals'
);

module.exports = Hospital;
