/* ------------------------------------------------------------------------------------------------------------------ */
/*                                         Functions Related To Hospital Save                                         */
/* ------------------------------------------------------------------------------------------------------------------ */

// const temp_verified_hospitals_schema = require("../models/Hospital/temp_verified_ospitals");
// const hospTrackerSchema = require("../models/HospIdTracker/hosp_id_tracker");
const temp_verified_hospitals_schema = require("../../../models/hospitals/onboarding_hospitals_model");
const verified_hospitals_schema = require("../../../models/hospitals/verified_hospitals_model");
const hospTrackerSchema = require("../../../models/hospitals/hospital_id_tracker_model");
const passwordgen = require("../helpers/password_gen");
const { response } = require("express");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const fetch = require("node-fetch");
const reader = require('xlsx');
const crypto = require("crypto");
const { google } = require('googleapis');

const HospitalTable = require("../../../models/hospital-schema");

const nodemailer = require('nodemailer');



/* -------------------------------------------------- Sending Email Credentials -------------------------------------------------- */
const CLIENT_ID = '168438088579-d77o04co2nb75sbgqf8lmc1jh01aaiki.apps.googleusercontent.com';
const CLEINT_SECRET = 'Uq2NNmcKr6uR1LyCZ-zvK4r3';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04cQGDkJNePgMCgYIARAAGAQSNwF-L9Ir7VTRMwbgzqwq2-5nuL-sQNDSlBKhNekIqgBHvvR743sAX6BeTOU5UpmcTrbTGJGTjQs';
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLEINT_SECRET,
    REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
/* -------------------------------------------------- Sending Email Credentials -------------------------------------------------- */



const getNextSequenceValue = async (sequenceName) => {
	return new Promise(async (resolve, reject) => {
		try {
			const sequenceDocument = await hospTrackerSchema.findOneAndUpdate(
				{ idType: process.env.HOSPITAL_ID_TRACKER },
				{
					$inc: {
						idNumber: 1,
					},
				},
				{
					new: true,
				}
			);
			// await hospTrackerSchema.updateOne(
			// 	{
			// 		idType: Keys.HOSPITAL_ID_TRACKER,
			// 	},
			// 	{
			// 		$inc: {
			// 			idNumber: 1,
			// 		},
			// 	}
			// );
			// const sequenceDocument = await hospTrackerSchema.findOne({
			// 	idType: Keys.HOSPITAL_ID_TRACKER,
			// });

			if (!sequenceDocument) {
				throw "Error with Database. sequenceDocument not found";
			}
			const idnumber = sequenceDocument.idNumber;
			resolve(sequenceDocument.idNumber);
		} catch (error) {
			console.log(error);
			reject(error);
		}
	});
};
signToken = (user) => {
	return JWT.sign(
		{
			iss: "EasyAsptal",
			sub: user,
			iat: new Date().getTime(), // current time
			exp: new Date().getTime() + 72000000, // current time + 2 hours ahead
		},
		process.env.JWT_SECRET
	);
};
const getToken = async (details) => {
	// Generate token
	const token = signToken(details);
	console.log("Token generated and Sent");
	return token;
};
module.exports = {
	/* ----------------------------- This Function Saves The Hospital In The Temporary Table ---------------------------- */
	preboardRegister: async (req, res, next) => {
		try {
			const { ea_support_email, hosp_name, hosp_placeid } = req.body;
			const isPresent = await temp_verified_hospitals_schema.findOne({
				placeId: hosp_placeid,
			});
			if (isPresent) {
				console.log("Password and HospitalId are already generated");
				const result = {
					Status: 0,
					Error: "Password and HospitalId are already generated",
				};
				res.status(403).json(result);
			} else {
				const latlngFinderUrl =
					"https://maps.googleapis.com/maps/api/place/details/json?place_id=" +
					hosp_placeid +
					"&key=" +
					process.env.PlacesApi;
				+"";
				const fetchRes = await fetch(
					latlngFinderUrl
				).then((latlngFinderUrl) => latlngFinderUrl.json());
				if (fetchRes.status != "OK") throw "INVALID PLACE ID";
				else {
					const latitude = fetchRes.result.geometry.location.lat;
					const longitude = fetchRes.result.geometry.location.lng;

					const password = passwordgen();
					const hospitalid = await getNextSequenceValue("hospitalId");
					const newHospital = new temp_verified_hospitals_schema({
						placeId: hosp_placeid,
						password: password,
						name: hosp_name,
						hospitalId: hospitalid,
						supportEmail: ea_support_email,
						latitude: latitude,
						longitude: longitude,
						saveStage: 1,
					});
					await newHospital.save();
					console.log("Hospital saved!!!");
					const result = {
						Status: 1,
						hospitalId: hospitalid,
						password: password,
					};
					res.status(200).json(result);
				}
			}
		} catch (error) {
			console.log(error);
			const result = {
				Status: 0,
				Error: error,
			};
			res.status(400).json(result);
		}
	},

	preboardSignIn: async (req, res, next) => {
		const { hospitalId, password } = req.body;
		const hospital_details = await verified_hospitals_schema.findOne({
			hospitalId: hospitalId,
		});
		if (hospital_details === null) {
			const result = {
				Status: 0,
				Error: "Wrong Hospital Id",
			};
			res.status(401).json(result);
		} else {
			const isMatch = await hospital_details.isValidPassword(
				password,
				hospital_details.password
			);
			if (!isMatch) {
				console.log("incorrect password");
				const result = {
					Status: 0,
					Error: "Wrong Password",
				};
				res.status(401).json(result);
			} else {
				const token = await getToken(hospital_details.id);
				const result = {
					Status: 1,
					Id: hospital_details.id,
					Name: hospital_details.name,
					Token: token,
					email: hospital_details.email,
					LastNotificationSeen: hospital_details.lastNotificationSeen,
					Stage: hospital_details.saveStage,
					Slogan: hospital_details.detailedDescription,
					Logo: hospital_details.hospitalLogo,
				};
				res.status(200).json(result);
			}

			// If the user successfully logs in, return the userinfo to the next function.
		}
	},



	forgotpassword: async (req, res, next) => {

		const { email } = req.body;

		const CheckHospital = await HospitalTable.countDocuments({
			email: email
		});

		if (CheckHospital > 0) {
			var token = 'Yes';

			// Generate new password
			const password = passwordgen();

			const salt = await bcrypt.genSalt(10);
			var hashpass = await bcrypt.hash(password, salt);
	
			var myquery = { email: email };
			var newvalues = { $set: { password: hashpass } };
			const ResetPass = await HospitalTable.updateOne(myquery, newvalues)
	

			const accessToken = await oAuth2Client.getAccessToken();
			const transport = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					type: 'OAuth2',
					user: 'info@easyaspataal.com',
					clientId: CLIENT_ID,
					clientSecret: CLEINT_SECRET,
					refreshToken: REFRESH_TOKEN,
					accessToken: accessToken,
				},
			});

			const mailOptions = {
				from: 'info@easyaspataal.com',
				to: email,
				subject: 'EasyAspataal - Password Reset',
				text: 'Dear Customer, \n\nYour new Password is : '+ password +'\n\n\n\n\n\n Warm regards,\nEasyAspataal Team',
				// html: '<h1>Hello from gmail email using API</h1>',
			};

			transport.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});

		}
		else {
			var token = 'No';
		}
		res.status(200).json(token);
	},


	resetpassword: async (req, res, next) => {
		const { email, password, oldpassword } = req.body;

		const hospital_details = await verified_hospitals_schema.findOne({
			email: email,
		});

		const isMatch = await hospital_details.isValidPassword(
			oldpassword,
			hospital_details.password
		);
		if (!isMatch) {
			res.status(200).json('invalid');
		}
		else {
		const salt = await bcrypt.genSalt(10);
		// now we set user password to hashed password
		var hashpass = await bcrypt.hash(password, salt);

		var myquery = { email: email };
		var newvalues = { $set: { password: hashpass } };
		const ResetPass = await HospitalTable.updateOne(myquery, newvalues)

		res.status(200).json('Success');
		}
	},

	// Hospital Onboard
	// Created : 26-4-2021 Prayag
	OnBoardHospital: async (req, res, next) => {
		try {

			const { email, name, address, phone, slogan, logo } = req.body;

			const isPresent = await verified_hospitals_schema.findOne({
				name: name,
			});
			if (isPresent) {
				res.status(200).json('Hospital already exists');
			}
			else {
				const password = passwordgen();

				const HospID = await verified_hospitals_schema.aggregate([
					{ $sort: { 'hospitalId': -1 } },
					{ $limit: 1 },
					{
						$project: {
							hospitalId: 1.0,
						}
					},
				]);
				const hospitalID = HospID[0].hospitalId + 1;

				const salt = await bcrypt.genSalt(10);
				var hashpass = await bcrypt.hash(password, salt);

				const newHospital = new verified_hospitals_schema({
					name: name,
					phone1: phone,
					email: email,
					address: address,
					slogan: slogan,
					hospitalId: hospitalID,
					password: hashpass,
					hospitalLogo: logo,
				});
				await newHospital.save();
				const result = {
					Status: 1,
					hospitalId: hospitalID,
					password: password,
				};
				res.status(200).json(result);
			}

		} catch (error) {
			console.log(error);
			const result = {
				Status: 0,
				Error: error,
			};
			res.status(400).json(result);
		}
	},


	// Excel Hospital Onboard
	// Created : 26-4-2021 Prayag
	OnBoardHospitalExcel: async (req, res, next) => {
		try {
			let Alldata = [];
			const excelfile = reader.readFile('./test.xlsx');

			const HospID = await verified_hospitals_schema.aggregate([
				{ $sort: { 'hospitalId': -1 } },
				{ $limit: 1 },
				{
					$project: {
						hospitalId: 1.0,
					}
				},
			]);
			var hospitalID = HospID[0].hospitalId + 1;

			const temp = reader.utils.sheet_to_json(
				excelfile.Sheets[excelfile.SheetNames[0]]);

			for (let index = 0; index < temp.length; index++) {
				const isPresent = await verified_hospitals_schema.findOne({
					name: temp[index].name,
				});
				if (isPresent) {
					res.status(200).json('Hospital already exists');
				}
				else {
				const password = passwordgen();
				const salt = await bcrypt.genSalt(10);
				var hashpass = await bcrypt.hash(password, salt);
				temp[index].hospitalId = hospitalID;
				temp[index].password = hashpass;
				const newHospital = new verified_hospitals_schema(temp[index]);
				await newHospital.save();
				Alldata.push({
					'name': temp[index].name,
					'HospitalID': hospitalID,
					'Password': password,
				})
				hospitalID++;
			}
			res.status(200).json(Alldata);
		}
		} catch (error) {
			console.log(error);
			const result = {
				Status: 0,
				Error: error,
			};
			res.status(400).json(result);
		}
	},


};
