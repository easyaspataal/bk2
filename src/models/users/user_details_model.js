/*
 *******************************************************************************************
 *****************************This file sets up the User Schema*****************************
 *******************************************************************************************
 */
//////////Requirements\\\\\\\\\\

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const patientSchema = require("../patients/patient_details_schema");

/////////////////////////////////////////////////////////////////////////////////

// Create the User Schema

const userSchema = new Schema({
	oauthid: {
		type: String,
		default: "",
	},
	method: {
		type: String,
	},
	email: {
		type: String,
		lowercase: true,
	},
	phone: {
		type: String,
	},
	password: {
		type: String,
	},
	firstname: {
		type: String,
	},
	lastname: {
		type: String,
	},
	gender: {
		type: String,
	},
	createDate: Date,
	modifiedDate: Date,
	dateOfBirth: {
		type: String,
	},
	active: {
		type: String,
		default: "active",
	},
	resetlink: {
		type: String,
		default: "",
	},
	resetlinkExpiry: {
		type: Number,
		default: null,
	},
	city: {
		type: String,
		default: "",
	},
	pinCode: {
		type: String,
		default: "",
	},
	photo: {
		data: Buffer,
		contentType: String,
		default: "",
	},
	addressLine1: {
		type: String,
		default: "",
	},
	addressLine2: {
		type: String,
		default: "",
	},
	lastNotificationSeen: {
		type: Number,
	},
	paymentOption: {
		card: [
			{
				cardNumber: Number,
				cardName: String,
				CVV: String,
			},
		],
		upi: [
			{
				upiID: String,
				bank: String,
			},
		],
	},
	patients: [patientSchema],
});

//This function hashes the password entered by a new user before saving to the db.
//Bcrypt is used with 10 salt rounds.
// userSchema.pre("save", async function (next) {
// 	try {
// 		//Check if the user has used social media signup procedure. Social media signup does not require passoword
// 		if (this.method !== "local") {
// 			console.log(this.method);
// 			console.log("nothing");
// 			next();
// 		} else {
// 			// Generate a salt
// 			const salt = await bcrypt.genSalt(10);
// 			console.log(this.password);
// 			// Generate a password hash (salt + hash)
// 			const passwordHash = await bcrypt.hash(this.password, salt);
// 			// Re-assign hashed version over original, plain text password
// 			this.password = passwordHash;
// 			console.log(this.password);
// 			next();
// 		}
// 	} catch (error) {
// 		next(error);
// 	}
// });

//This function uses bcrypt to compare the password entered by user to the hashed password present in database
userSchema.methods.isValidPassword = async function (
	newPassword,
	userPassword
) {
	try {
		console.log(userPassword);
		return await bcrypt.compare(newPassword, userPassword);
	} catch (error) {
		throw new Error(error);
	}
};

// Create a model.
/*
Structure - mongoose.model((unique name of schema), (schema to be used), (Collection name which will appear in mongodb) )
*/
const User = mongoose.model("UserDetails", userSchema, "Updated-User-Data");

// Export the model
module.exports = User;
