const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const patientSchema = new Schema({
	aadhaarNumber: {
		type: String,
	},
	fullName: {
		type: String,
	},
	dateOfBirth: {
		type: String,
	},
	email: {
		type: String,
	},
	gender: {
		type: String,
	},
	phone: {
		type: String,
	},
	relationWithUser: {
		type: String,
		default: 'Self'
	},
	bloodGroup: {
		type: String,
	},
	timezone: {
		type: String,
	},
	profilePhoto: {
		type: String,
	},
	address: {
		addrline1: String,
		addrline2: String,
		city: String,
		state: String,
		country: String,
		pincode: Number,
	},
});

module.exports = patientSchema;
