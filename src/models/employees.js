const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Employees = new Schema({
    name: {
        type: String,
    },
    gender: {
        type: String,
    },
    cmobile: {
        type: Number,
    },
    corporate_id: {
        type: Schema.Types.ObjectId,
    },
    corporate_name: {
        type: String,
    },
    dob: {
        type: String,
    },
    CID: {
        type: String,
    },
    pan: {
        type: Number,
    },
    employee_id: {
        type: String,
    },
    joining_date: {
        type: String,
    },
    employment_status: {
        type: String,
    },
    sum_insured: {
        type: String,
    },
    insurance_company: {
        type: String,
    },
    cemail: {
        type: String,
    },
    marital_status: {
        type: String,
    },
    branch: {
        type: String,
    },
    designation: {
        type: String,
    },
    last_monthly_salary: {
        type: String,
    },
    dependent1: {
        type: String,
    },
    dependent2: {
        type: String,
    },
    dependent3: {
        type: String,
    },

    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'employees'
    })

module.exports = mongoose.model('Employees', Employees)