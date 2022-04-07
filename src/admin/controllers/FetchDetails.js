/* ----------------- This File Gets Data for Admin ----------------- */
/* ----------------- Created : 9-4-2021 by Prayag ----------------- */
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Storage } = require('@google-cloud/storage');
const moment = require('moment');
const axios = require('axios');
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Schemas -------------------------------------------------- */
const AdminSchema = require("../../models/admin/login");
const EasyLoanSchema = require("../../models/loan-request-schema");
const HospitalSchema = require("../../models/hospitals/verified_hospitals_model");
const RequestsSchema = require("../../models/requests-schema");
const CorporateSchema = require("../../models/corporate");
const RequestVaccinationSchema = require("../../models/requests-vaccination");
const UsersSchema = require("../../models/users");
const EstimationSchema = require("../../models/requests-estimation");
const SurgerySchema = require("../../models/requests-surgery");
const KycSchema = require("../../models/requests-kyc");
/* ------------------------------------------------------------------------------------------------------------------ */


module.exports = {
    // Check Admin User
    // 10-4-2021 Prayag
    Login: async (req, res) => {
        try {
            const username = req.body.username;
            
            const AdminDetail = await AdminSchema.findOne({
                username: username,
            });
            if (AdminDetail === null) {
                res.json('Fail');
            } else {  
                const isMatch = await bcrypt.compare(req.body.password, AdminDetail.password);
                if (!isMatch) {
                    res.json('Fail');
                }
                else {
                    res.json('Success');
                }
               }
        } catch (error) {
            console.log(error);
        }
    },


    // Fetch Easy Loan Data
    // 12-4-2021 Prayag
    EasyLoan: async (req, res) => {
        try {   
            const Result = [];         
            const EasyLoanDetails = await RequestsSchema.find();
            // for (let index = 0; index < EasyLoanDetails.length; index++) {
            //     if (EasyLoanDetails[index].from === 'ui') {
            //         var source = 'ui';
            //     }
            //     else if (EasyLoanDetails[index].from === 'request') {
            //         var source = 'request';
            //     }
            //     else if (EasyLoanDetails[index].from === 'otp') {
            //         var source = 'otp';
            //     }
            //     else {
            //         const Hospital = await HospitalSchema.findById(EasyLoanDetails[index].from);
            //         var source = Hospital.name;
            //     }
            //     Result.push({
            //         'id': EasyLoanDetails[index]._id,
            //         'name': EasyLoanDetails[index].name,
            //         'amount': EasyLoanDetails[index].loan_amount,
            //         'created': EasyLoanDetails[index].created_date,
            //         'mobile': EasyLoanDetails[index].mobile,
            //         'source': source,
            //         'status': EasyLoanDetails[index].status,
            //     })
            // }
            res.json(EasyLoanDetails);
        } catch (error) {
            console.log(error);
        }
    },


    // Fetch All Hospitals
    // 6-5-2021 Prayag
    HospitalListing: async (req, res) => {
        try {   
            const HospitalsData = await HospitalSchema.find();
            res.json(HospitalsData);
        } catch (error) {
            console.log(error);
        }
    },


	// Selected Hospital Details
	// 29-5-2021 Prayag
	SelectedHospital: async (req, res) => {
		try {
			const hospitalid = req.query.HospitalID;
			const SelectedHospitalData = await HospitalSchema.findById(hospitalid);

			const HospitalImages = [];
			const HospitalImagesUrls = [];

			// Get Images from Bucket
			
			const projectId = 'eamigrate';
			const keyFilename = 'src/configuration/private_bucket_keys.json';
			const PrivateBucket = new Storage({ projectId, keyFilename });
			const options = {
				prefix: 'hospitals/' + SelectedHospitalData.name,
			};
			const [files] = await PrivateBucket.bucket('main_pvt').getFiles(options);
			files.forEach(file => {
				HospitalImages.push(file.name);
			});

			const options2 = {
				version: 'v2', // defaults to 'v2' if missing.
				action: 'read',
				expires: Date.now() + 1000 * 60 * 60, // one hour
			};

			for (let index = 0; index < HospitalImages.length; index++) {
				const url = await PrivateBucket
					.bucket('main_pvt')
					.file(HospitalImages[index])
					.getSignedUrl(options2);
				HospitalImagesUrls.push(url[0]);
			}

			const result = {
				Status: 1,
				Images: HospitalImagesUrls,
				HospitalDetail: SelectedHospitalData,
			};
			res.status(200).json(result);
		} catch (error) {
			console.log(error);
			res.status(400).json('Fail');
		}
	},

    // Fetch All Corporates
    // 7-6-2021 Prayag
    CorporateListing: async (req, res) => {
        try {   
            const CorporatesData = await CorporateSchema.find();
            res.json(CorporatesData);
        } catch (error) {
            console.log(error);
        }
    },


	// Selected Corporate Details
	// 11-6-2021 Prayag
	SelectedCorporate: async (req, res) => {
		try {
			const corporateid = req.query.CorporateID;
			const SelectedCorporate = await CorporateSchema.findById(corporateid);

            const CorporateVaccination = await RequestVaccinationSchema.findOne({corporate_id: corporateid});

			const result = {
				Status: 1,
				CorporateData: SelectedCorporate,
				CorporateVaccinationData: CorporateVaccination,
			};
			res.status(200).json(result);
		} catch (error) {
			console.log(error);
			res.status(400).json('Fail');
		}
	},

    // Get All Leads
    LeadsListing: async (req, res) => {
        try {   
            const UsersData = await UsersSchema.find();
            var Leads=[];
            // var email;
            // var contact;
                for (let index = 0; index < UsersData.length; index++) {
                if (UsersData[index]['email'] == ''|| UsersData[index]['email'] == null){
                    var email = UsersData[index]['cemail']
                }
                else{
                    var email = UsersData[index]['email']
                }
                if (UsersData[index]['mobile'] == '' || UsersData[index]['mobile'] == null) {
                   var contact = UsersData[index]['cmobile']
                }
                else{
                   var  contact = UsersData[index]['mobile']
                }
                Leads.push({
                    mongoid: UsersData[index]._id,
                    email: email,
                    contact: contact,
                    name:UsersData[index].name,
                    from:UsersData[index].from,
                    created_date:moment(UsersData[index].created_date).format('DD-MM-YYYY'),
                })
            }       
        
            res.json(Leads);
        } catch (error) {
            console.log(error);
        }
    },
	
    // Get Selected Leads Data
    SelectedLead: async (req, res) => {
		try {
			const mongoid = req.query.mongoid;
          
            const SelectedLeads = await UsersSchema.findById(mongoid);
            const UsersEstimation = await EstimationSchema.findOne({EID: SelectedLeads.EID});
            const UsersKyc = await KycSchema.findOne({EID: SelectedLeads.EID});
            const UsersSurgery = await SurgerySchema.findOne({EID: SelectedLeads.EID});

			const result = {
                status: true,
				UsersData: SelectedLeads,
				UsersEstimationData:UsersEstimation ,
                UsersKycData: UsersKyc,
                UsersSurgeyData:UsersSurgery,
			};
			res.status(200).json(result);
		} catch (error) {
			console.log(error);
			res.status(400).json('Fail');
		}
	},

Getequifax: async (req, res) => {
        try {
            var data = JSON.stringify({
              "name": req.query.name,
              "address": req.query.address,
              "state": req.query.state,
              "pin": req.query.pin,
              "contact": req.query.contact,
              "email": req.query.email,
              "pan": req.query.pan,
              "dob": req.query.dob
            });
            var config = {
              method: 'post',
              url: 'http://3.111.122.53:8050/equifax',
              headers: {
                'Content-Type': 'application/json'
              },
              data : data
            };
            axios(config)
            .then(function (response) {
              var score = response.data;
              const result = {
                status: true,
                message: score
            };
            res.json(result);
            })
            .catch(function (error) {
              console.log(error);
            });
            // res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(400).json('Fail');
        }
    },
	
};
