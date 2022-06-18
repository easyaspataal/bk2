/* ----------------- This File Saves Data from Admin ----------------- */
/* ----------------- Created : 9-4-2021 by Prayag ----------------- */
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const fs = require('fs');
const reader = require('xlsx');
const axios = require('axios');
const bcrypt = require("bcryptjs");
const { google } = require('googleapis');
const passwordgen = require("../helpers/password_gen");
const { Storage } = require('@google-cloud/storage');
const SendSMS = require('../../third_party/sms');
const SendEmail = require('../../third_party/qr_email');
const EasyLoanSchema = require("../../models/loan-request-schema");
const verified_hospitals_schema = require("../../models/hospitals/verified_hospitals_model");
const CitiesSchema = require("../../models/cities/city_model");
const RequestVaccinationSchema = require("../../models/requests-vaccination");
const UsersSchema = require("../../models/users");
const HospitalSchema = require("../../models/new_hospitals");
const OtpEmail = require('../../third_party/email');
/* ------------------------------------------------------------------------------------------------------------------ */


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



module.exports = {
    // Save Uploaded Files
    // 10-4-2021 Prayag
    Uploads: async (req, res) => {
        try {
            const projectId = 'eamigrate';
            const keyFilename = 'src/configuration/private_bucket_keys.json';
            const PrivateBucket = new Storage({ projectId, keyFilename });

            fs.writeFile(req.body.filename, req.body.data, 'base64', error => {
                if (error) {
                    throw error;
                } else {
                    const bucket = PrivateBucket.bucket('main_pvt');
                    bucket.upload(req.body.filename, { destination: "hospitals/" + req.body.hospitalname + "/" + req.body.filename }, function (err, file) {
                        if (err) {
                            throw new Error(err);
                        }
                        fs.unlinkSync(req.body.filename);
                    });
                }
            });
            res.json('Success')
        } catch (error) {
            console.log(error);
        }
    },


    // Upload QR
    // 10-12-2021 Sampat
    UploadQr: async (req, res) => {
        try {
            const projectId = 'eamigrate';
            const keyFilename = 'src/configuration/private_bucket_keys.json';
            const PrivateBucket = new Storage({ projectId, keyFilename });
            fs.writeFile(req.body.filename, req.body.data, 'base64', error => {
                if (error) {
                    throw error;
                } else {
                    const bucket = PrivateBucket.bucket('main_pvt');
                    bucket.upload(req.body.filename, { destination: "hospitals/" + req.body.hospitalname + "/" + req.body.filename }, async function (err, file) {
                        if (err) {
                            throw new Error(err);
                        }
                        const hospitalData = await HospitalSchema.findOne({ HID: req.body.HID });
                        // Send notification via Email
                        const Subject = req.body.password;
                        //const Message = 'Hi Team,\n\n Hospital with below details has initiated the';
                        const EmailSend = await SendEmail(hospitalData.email, Subject, hospitalData);
                        //    fs.unlinkSync(req.body.filename);
                        //    const EmailSendInternal = await SendEmail('pratik@easyaspataal.com', Subject, Message);
                    });
                }
            });
            res.json('Success')
        } catch (error) {
            console.log(error);
        }
    },


    // Update Easy Loan Status
    // 17-4-2021 Prayag
    UpdateLoanStatus: async (req, res) => {
        try {
            const { id } = req.body;
            const { status } = req.body;
            EasyLoanSchema.updateOne({ _id: id }, {
                status: status,
            }, function (err, affected, resp) {
                console.log(resp);
            })
            res.status(200).json('Success');
        } catch (error) {
            console.log(error);
        }
    },

    // Hospital Onboarding Excel
    // 27-4-2021 Prayag
    UploadExcel: async (req, res) => {
        try {
            const projectId = 'eamigrate';
            const keyFilename = 'src/configuration/private_bucket_keys.json';
            const PrivateBucket = new Storage({ projectId, keyFilename });

            var hospitalname = '';

            fs.writeFile(req.body.filename, req.body.data, 'base64', error => {
                if (error) {
                    throw error;
                } else {
                    // Save Uploaded Excel to Bucket
                    const bucket = PrivateBucket.bucket('main_pvt');
                    bucket.upload(req.body.filename, { destination: "hospitals/" + req.body.filename }, async function (err, file) {
                        if (err) {
                            throw new Error(err);
                        }
                        // Read Excel
                        const excelfile = reader.readFile('./' + req.body.filename);

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
                                name: temp[index].name, pincode: temp[index].pincode
                            });
                            if (isPresent) {
                                let Facilities = [];
                                let Specialities = [];
                                let Amenities = [];

                                // Facilities Check
                                if (temp[index]['ICU'] == 'y') {
                                    Facilities.push('ICU');
                                }
                                if (temp[index]['MICU'] == 'y') {
                                    Facilities.push('MICU');
                                }
                                if (temp[index]['CICU'] == 'y') {
                                    Facilities.push('CICU');
                                }
                                if (temp[index]['NICU'] == 'y') {
                                    Facilities.push('NICU');
                                }
                                if (temp[index]['PICU'] == 'y') {
                                    Facilities.push('PICU');
                                }
                                if (temp[index]['IPD'] == 'y') {
                                    Facilities.push('IPD');
                                }
                                if (temp[index]['OPD'] == 'y') {
                                    Facilities.push('OPD');
                                }
                                if (temp[index]['Emergency and Trauma'] == 'y') {
                                    Facilities.push('Emergency and Trauma');
                                }
                                if (temp[index]['Laboratory'] == 'y') {
                                    Facilities.push('Laboratory');
                                }
                                if (temp[index]['Imaging'] == 'y') {
                                    Facilities.push('Imaging');
                                }
                                if (temp[index]['Pharmacy'] == 'y') {
                                    Facilities.push('Pharmacy');
                                }
                                if (temp[index]['Transplant Immunology and Immunogenetics'] == 'y') {
                                    Facilities.push('Transplant Immunology and Immunogenetics');
                                }
                                if (temp[index]['Labour Room'] == 'y') {
                                    Facilities.push('Labour Room');
                                }
                                if (temp[index]['Blood Banks'] == 'y') {
                                    Facilities.push('Blood Banks');
                                }
                                if (temp[index]['Blood Storage'] == 'y') {
                                    Facilities.push('Blood Storage');
                                }
                                if (temp[index]['Eye Bank'] == 'y') {
                                    Facilities.push('Eye Bank');
                                }
                                if (temp[index]['Organ Bank'] == 'y') {
                                    Facilities.push('Organ Bank');
                                }
                                if (temp[index]['Ambulance'] == 'y') {
                                    Facilities.push('Ambulance');
                                }
                                if (temp[index]['Dialysis Unit'] == 'y') {
                                    Facilities.push('Dialysis Unit');
                                }
                                if (temp[index]['Operation Theater'] == 'y') {
                                    Facilities.push('Operation Theater');
                                }
                                if (temp[index]['Physiotherapy'] == 'y') {
                                    Facilities.push('Physiotherapy');
                                }
                                if (temp[index]['Occupational Therapy'] == 'y') {
                                    Facilities.push('Occupational Therapy');
                                }
                                if (temp[index]['Diagnostics'] == 'y') {
                                    Facilities.push('Diagnostics');
                                }
                                if (temp[index]['Medical Tourism'] == 'y') {
                                    Facilities.push('Medical Tourism');
                                }



                                // Specialities Check
                                if (temp[index]['Anaesthesiology'] == 'y') {
                                    Specialities.push('Anaesthesiology');
                                }
                                if (temp[index]['Anatomy'] == 'y') {
                                    Specialities.push('Anatomy');
                                }
                                if (temp[index]['Bariatric Surgery'] == 'y') {
                                    Specialities.push('Bariatric Surgery');
                                }
                                if (temp[index]['Biochemistry'] == 'y') {
                                    Specialities.push('Biochemistry');
                                }
                                if (temp[index]['Biomedical Engineering'] == 'y') {
                                    Specialities.push('Biomedical Engineering');
                                }
                                if (temp[index]['Biophysics'] == 'y') {
                                    Specialities.push('Biophysics');
                                }
                                if (temp[index]['Biostatistics'] == 'y') {
                                    Specialities.push('Biostatistics');
                                }
                                if (temp[index]['Biotechnology'] == 'y') {
                                    Specialities.push('Biotechnology');
                                }
                                if (temp[index]['Burn Department'] == 'y') {
                                    Specialities.push('Burn Department');
                                }
                                if (temp[index]['Cardiology'] == 'y') {
                                    Specialities.push('Cardiology');
                                }
                                if (temp[index]['Cardio Thoracic Vascular Surgery'] == 'y') {
                                    Specialities.push('Cardio Thoracic Vascular Surgery');
                                }
                                if (temp[index]['Centre for Community Medicine'] == 'y') {
                                    Specialities.push('Centre for Community Medicine');
                                }
                                if (temp[index]['Cosmetic Surgery'] == 'y') {
                                    Specialities.push('Cosmetic Surgery');
                                }
                                if (temp[index]['Dermatology and Venereology'] == 'y') {
                                    Specialities.push('Dermatology and Venereology');
                                }
                                if (temp[index]['Dietetics'] == 'y') {
                                    Specialities.push('Dietetics');
                                }
                                if (temp[index]['Dental'] == 'y') {
                                    Specialities.push('Dental');
                                }
                                if (temp[index]['Endocrinology, Metabolism and Diabetes'] == 'y') {
                                    Specialities.push('Endocrinology, Metabolism and Diabetes');
                                }
                                if (temp[index]['Forensic Medicine and Toxicology'] == 'y') {
                                    Specialities.push('Forensic Medicine and Toxicology');
                                }
                                if (temp[index]['Gastroenterology and Human Nutrition'] == 'y') {
                                    Specialities.push('Gastroenterology and Human Nutrition');
                                }
                                if (temp[index]['Gastrointestinal Surgery'] == 'y') {
                                    Specialities.push('Gastrointestinal Surgery');
                                }
                                if (temp[index]['General Surgery'] == 'y') {
                                    Specialities.push('General Surgery');
                                }
                                if (temp[index]['Hematology'] == 'y') {
                                    Specialities.push('Hematology');
                                }
                                if (temp[index]['Internal Medicine'] == 'y') {
                                    Specialities.push('Internal Medicine');
                                }
                                if (temp[index]['Kidney Transplant'] == 'y') {
                                    Specialities.push('Kidney Transplant');
                                }
                                if (temp[index]['Laboratory Medicine'] == 'y') {
                                    Specialities.push('Laboratory Medicine');
                                }
                                if (temp[index]['Liver Transplant'] == 'y') {
                                    Specialities.push('Liver Transplant');
                                }
                                if (temp[index]['Laparoscopic Surgery'] == 'y') {
                                    Specialities.push('Laparoscopic Surgery');
                                }
                                if (temp[index]['Medicine'] == 'y') {
                                    Specialities.push('Medicine');
                                }
                                if (temp[index]['Microbiology'] == 'y') {
                                    Specialities.push('Microbiology');
                                }
                                if (temp[index]['Nephrology'] == 'y') {
                                    Specialities.push('Nephrology');
                                }
                                if (temp[index]['Nuclear Medicine'] == 'y') {
                                    Specialities.push('Nuclear Medicine');
                                }
                                if (temp[index]['Neurology'] == 'y') {
                                    Specialities.push('Neurology');
                                }
                                if (temp[index]['Neuron Surger'] == 'y') {
                                    Specialities.push('Neuron Surger');
                                }
                                if (temp[index]['Nuclear Magnetic Resonance Imaging'] == 'y') {
                                    Specialities.push('Nuclear Magnetic Resonance Imaging');
                                }
                                if (temp[index]['Obstetrics and Gynaecology'] == 'y') {
                                    Specialities.push('Obstetrics and Gynaecology');
                                }
                                if (temp[index]['In Vitro Fertilization (IVF)'] == 'y') {
                                    Specialities.push('In Vitro Fertilization (IVF)');
                                }
                                if (temp[index]['Oncology/ Oncosurgery (Cancer Care)'] == 'y') {
                                    Specialities.push('Oncology/ Oncosurgery (Cancer Care)');
                                }
                                if (temp[index]['Orthopedics'] == 'y') {
                                    Specialities.push('Orthopedics');
                                }
                                if (temp[index]['Ophthalmology (Eye Care)'] == 'y') {
                                    Specialities.push('Ophthalmology (Eye Care)');
                                }
                                if (temp[index]['Otorhinolaryngology (Ear Nose and Throat)'] == 'y') {
                                    Specialities.push('Otorhinolaryngology (Ear Nose and Throat)');
                                }
                                if (temp[index]['Pediatrics'] == 'y') {
                                    Specialities.push('Pediatrics');
                                }
                                if (temp[index]['Pediatric Surgery'] == 'y') {
                                    Specialities.push('Pediatric Surgery');
                                }
                                if (temp[index]['Pulmonology/ Respiratory Medicine'] == 'y') {
                                    Specialities.push('Pulmonology/ Respiratory Medicine');
                                }
                                if (temp[index]['Trauma and Emergency Medicine'] == 'y') {
                                    Specialities.push('Trauma and Emergency Medicine');
                                }
                                if (temp[index]['Plastic Surgery (Reconstructive Surgery)'] == 'y') {
                                    Specialities.push('Plastic Surgery (Reconstructive Surgery)');
                                }
                                if (temp[index]['Pharmacology'] == 'y') {
                                    Specialities.push('Pharmacology');
                                }
                                if (temp[index]['Physiology'] == 'y') {
                                    Specialities.push('Physiology');
                                }
                                if (temp[index]['Physical Medicine and Rehabilitation'] == 'y') {
                                    Specialities.push('Physical Medicine and Rehabilitation');
                                }
                                if (temp[index]['Psychiatry'] == 'y') {
                                    Specialities.push('Psychiatry');
                                }
                                if (temp[index]['Reproductive Biology'] == 'y') {
                                    Specialities.push('Reproductive Biology');
                                }
                                if (temp[index]['Surgical Disciplines'] == 'y') {
                                    Specialities.push('Surgical Disciplines');
                                }
                                if (temp[index]['Transplant Surgery'] == 'y') {
                                    Specialities.push('Transplant Surgery');
                                }
                                if (temp[index]['Transfusion Medicine (Blood Bank)'] == 'y') {
                                    Specialities.push('Transfusion Medicine (Blood Bank)');
                                }
                                if (temp[index]['Urology'] == 'y') {
                                    Specialities.push('Urology');
                                }
                                if (temp[index]['Vascular Surgery'] == 'y') {
                                    Specialities.push('Vascular Surgery');
                                }

                                // Amenities Check
                                if (temp[index]['Air cooler'] == 'y') {
                                    Amenities.push('Air cooler');
                                }
                                if (temp[index]['Beds'] == 'y') {
                                    Amenities.push('Beds');
                                }
                                if (temp[index]['Bench for attendant'] == 'y') {
                                    Amenities.push('Bench for attendant');
                                }
                                if (temp[index]['Washroom'] == 'y') {
                                    Amenities.push('Washroom');
                                }
                                if (temp[index]['Air condition'] == 'y') {
                                    Amenities.push('Air condition');
                                }
                                if (temp[index]['Spacious, TV'] == 'y') {
                                    Amenities.push('Spacious, TV');
                                }
                                if (temp[index]['Wardrobe'] == 'y') {
                                    Amenities.push('Wardrobe');
                                }
                                if (temp[index]['Intercom'] == 'y') {
                                    Amenities.push('Intercom');
                                }
                                if (temp[index]['Nurse call bell'] == 'y') {
                                    Amenities.push('Nurse call bell');
                                }
                                if (temp[index]['Microwave'] == 'y') {
                                    Amenities.push('Microwave');
                                }
                                if (temp[index]['Refrigerator'] == 'y') {
                                    Amenities.push('Refrigerator');
                                }
                                if (temp[index]['Dining Table & chairs'] == 'y') {
                                    Amenities.push('Dining Table & chairs');
                                }
                                if (temp[index]['Separate bed for attendant stay'] == 'y') {
                                    Amenities.push('Separate bed for attendant stay');
                                }

                                // Saving Arrays to db names
                                temp[index].facilities = Facilities;
                                temp[index].specialities = Specialities;
                                temp[index].amenities = Amenities;


                                // EasyLoanSchema.updateOne({ _id: id }, {
                                //     status: status,
                                // }, function (err, affected, resp) {
                                //     console.log(resp);
                                // })


                                verified_hospitals_schema.update({ name: temp[index].name, pincode: temp[index].pincode }, temp[index], function (err, raw) {
                                    if (err) {
                                        res.send(err);
                                    }
                                    res.send(raw);
                                });
                                hospitalID++;
                                var hospitalname = temp[index].name;
                            }
                            else {
                                const password = passwordgen();
                                const salt = await bcrypt.genSalt(10);
                                var hashpass = await bcrypt.hash(password, salt);
                                temp[index].hospitalId = hospitalID;
                                temp[index].password = hashpass;


                                let Facilities = [];
                                let Specialities = [];
                                let Amenities = [];

                                // Facilities Check
                                if (temp[index]['ICU'] == 'y') {
                                    Facilities.push('ICU');
                                }
                                if (temp[index]['MICU'] == 'y') {
                                    Facilities.push('MICU');
                                }
                                if (temp[index]['CICU'] == 'y') {
                                    Facilities.push('CICU');
                                }
                                if (temp[index]['NICU'] == 'y') {
                                    Facilities.push('NICU');
                                }
                                if (temp[index]['PICU'] == 'y') {
                                    Facilities.push('PICU');
                                }
                                if (temp[index]['IPD'] == 'y') {
                                    Facilities.push('IPD');
                                }
                                if (temp[index]['OPD'] == 'y') {
                                    Facilities.push('OPD');
                                }
                                if (temp[index]['Emergency and Trauma'] == 'y') {
                                    Facilities.push('Emergency and Trauma');
                                }
                                if (temp[index]['Laboratory'] == 'y') {
                                    Facilities.push('Laboratory');
                                }
                                if (temp[index]['Imaging'] == 'y') {
                                    Facilities.push('Imaging');
                                }
                                if (temp[index]['Pharmacy'] == 'y') {
                                    Facilities.push('Pharmacy');
                                }
                                if (temp[index]['Transplant Immunology and Immunogenetics'] == 'y') {
                                    Facilities.push('Transplant Immunology and Immunogenetics');
                                }
                                if (temp[index]['Labour Room'] == 'y') {
                                    Facilities.push('Labour Room');
                                }
                                if (temp[index]['Blood Banks'] == 'y') {
                                    Facilities.push('Blood Banks');
                                }
                                if (temp[index]['Blood Storage'] == 'y') {
                                    Facilities.push('Blood Storage');
                                }
                                if (temp[index]['Eye Bank'] == 'y') {
                                    Facilities.push('Eye Bank');
                                }
                                if (temp[index]['Organ Bank'] == 'y') {
                                    Facilities.push('Organ Bank');
                                }
                                if (temp[index]['Ambulance'] == 'y') {
                                    Facilities.push('Ambulance');
                                }
                                if (temp[index]['Dialysis Unit'] == 'y') {
                                    Facilities.push('Dialysis Unit');
                                }
                                if (temp[index]['Operation Theater'] == 'y') {
                                    Facilities.push('Operation Theater');
                                }
                                if (temp[index]['Physiotherapy'] == 'y') {
                                    Facilities.push('Physiotherapy');
                                }
                                if (temp[index]['Occupational Therapy'] == 'y') {
                                    Facilities.push('Occupational Therapy');
                                }
                                if (temp[index]['Diagnostics'] == 'y') {
                                    Facilities.push('Diagnostics');
                                }
                                if (temp[index]['Medical Tourism'] == 'y') {
                                    Facilities.push('Medical Tourism');
                                }



                                // Specialities Check
                                if (temp[index]['Anaesthesiology'] == 'y') {
                                    Specialities.push('Anaesthesiology');
                                }
                                if (temp[index]['Anatomy'] == 'y') {
                                    Specialities.push('Anatomy');
                                }
                                if (temp[index]['Bariatric Surgery'] == 'y') {
                                    Specialities.push('Bariatric Surgery');
                                }
                                if (temp[index]['Biochemistry'] == 'y') {
                                    Specialities.push('Biochemistry');
                                }
                                if (temp[index]['Biomedical Engineering'] == 'y') {
                                    Specialities.push('Biomedical Engineering');
                                }
                                if (temp[index]['Biophysics'] == 'y') {
                                    Specialities.push('Biophysics');
                                }
                                if (temp[index]['Biostatistics'] == 'y') {
                                    Specialities.push('Biostatistics');
                                }
                                if (temp[index]['Biotechnology'] == 'y') {
                                    Specialities.push('Biotechnology');
                                }
                                if (temp[index]['Burn Department'] == 'y') {
                                    Specialities.push('Burn Department');
                                }
                                if (temp[index]['Cardiology'] == 'y') {
                                    Specialities.push('Cardiology');
                                }
                                if (temp[index]['Cardio Thoracic Vascular Surgery'] == 'y') {
                                    Specialities.push('Cardio Thoracic Vascular Surgery');
                                }
                                if (temp[index]['Centre for Community Medicine'] == 'y') {
                                    Specialities.push('Centre for Community Medicine');
                                }
                                if (temp[index]['Cosmetic Surgery'] == 'y') {
                                    Specialities.push('Cosmetic Surgery');
                                }
                                if (temp[index]['Dermatology and Venereology'] == 'y') {
                                    Specialities.push('Dermatology and Venereology');
                                }
                                if (temp[index]['Dietetics'] == 'y') {
                                    Specialities.push('Dietetics');
                                }
                                if (temp[index]['Dental'] == 'y') {
                                    Specialities.push('Dental');
                                }
                                if (temp[index]['Endocrinology, Metabolism and Diabetes'] == 'y') {
                                    Specialities.push('Endocrinology, Metabolism and Diabetes');
                                }
                                if (temp[index]['Forensic Medicine and Toxicology'] == 'y') {
                                    Specialities.push('Forensic Medicine and Toxicology');
                                }
                                if (temp[index]['Gastroenterology and Human Nutrition'] == 'y') {
                                    Specialities.push('Gastroenterology and Human Nutrition');
                                }
                                if (temp[index]['Gastrointestinal Surgery'] == 'y') {
                                    Specialities.push('Gastrointestinal Surgery');
                                }
                                if (temp[index]['General Surgery'] == 'y') {
                                    Specialities.push('General Surgery');
                                }
                                if (temp[index]['Hematology'] == 'y') {
                                    Specialities.push('Hematology');
                                }
                                if (temp[index]['Internal Medicine'] == 'y') {
                                    Specialities.push('Internal Medicine');
                                }
                                if (temp[index]['Kidney Transplant'] == 'y') {
                                    Specialities.push('Kidney Transplant');
                                }
                                if (temp[index]['Laboratory Medicine'] == 'y') {
                                    Specialities.push('Laboratory Medicine');
                                }
                                if (temp[index]['Liver Transplant'] == 'y') {
                                    Specialities.push('Liver Transplant');
                                }
                                if (temp[index]['Laparoscopic Surgery'] == 'y') {
                                    Specialities.push('Laparoscopic Surgery');
                                }
                                if (temp[index]['Medicine'] == 'y') {
                                    Specialities.push('Medicine');
                                }
                                if (temp[index]['Microbiology'] == 'y') {
                                    Specialities.push('Microbiology');
                                }
                                if (temp[index]['Nephrology'] == 'y') {
                                    Specialities.push('Nephrology');
                                }
                                if (temp[index]['Nuclear Medicine'] == 'y') {
                                    Specialities.push('Nuclear Medicine');
                                }
                                if (temp[index]['Neurology'] == 'y') {
                                    Specialities.push('Neurology');
                                }
                                if (temp[index]['Neuron Surger'] == 'y') {
                                    Specialities.push('Neuron Surger');
                                }
                                if (temp[index]['Nuclear Magnetic Resonance Imaging'] == 'y') {
                                    Specialities.push('Nuclear Magnetic Resonance Imaging');
                                }
                                if (temp[index]['Obstetrics and Gynaecology'] == 'y') {
                                    Specialities.push('Obstetrics and Gynaecology');
                                }
                                if (temp[index]['In Vitro Fertilization (IVF)'] == 'y') {
                                    Specialities.push('In Vitro Fertilization (IVF)');
                                }
                                if (temp[index]['Oncology/ Oncosurgery (Cancer Care)'] == 'y') {
                                    Specialities.push('Oncology/ Oncosurgery (Cancer Care)');
                                }
                                if (temp[index]['Orthopedics'] == 'y') {
                                    Specialities.push('Orthopedics');
                                }
                                if (temp[index]['Ophthalmology (Eye Care)'] == 'y') {
                                    Specialities.push('Ophthalmology (Eye Care)');
                                }
                                if (temp[index]['Otorhinolaryngology (Ear Nose and Throat)'] == 'y') {
                                    Specialities.push('Otorhinolaryngology (Ear Nose and Throat)');
                                }
                                if (temp[index]['Pediatrics'] == 'y') {
                                    Specialities.push('Pediatrics');
                                }
                                if (temp[index]['Pediatric Surgery'] == 'y') {
                                    Specialities.push('Pediatric Surgery');
                                }
                                if (temp[index]['Pulmonology/ Respiratory Medicine'] == 'y') {
                                    Specialities.push('Pulmonology/ Respiratory Medicine');
                                }
                                if (temp[index]['Trauma and Emergency Medicine'] == 'y') {
                                    Specialities.push('Trauma and Emergency Medicine');
                                }
                                if (temp[index]['Plastic Surgery (Reconstructive Surgery)'] == 'y') {
                                    Specialities.push('Plastic Surgery (Reconstructive Surgery)');
                                }
                                if (temp[index]['Pharmacology'] == 'y') {
                                    Specialities.push('Pharmacology');
                                }
                                if (temp[index]['Physiology'] == 'y') {
                                    Specialities.push('Physiology');
                                }
                                if (temp[index]['Physical Medicine and Rehabilitation'] == 'y') {
                                    Specialities.push('Physical Medicine and Rehabilitation');
                                }
                                if (temp[index]['Psychiatry'] == 'y') {
                                    Specialities.push('Psychiatry');
                                }
                                if (temp[index]['Reproductive Biology'] == 'y') {
                                    Specialities.push('Reproductive Biology');
                                }
                                if (temp[index]['Surgical Disciplines'] == 'y') {
                                    Specialities.push('Surgical Disciplines');
                                }
                                if (temp[index]['Transplant Surgery'] == 'y') {
                                    Specialities.push('Transplant Surgery');
                                }
                                if (temp[index]['Transfusion Medicine (Blood Bank)'] == 'y') {
                                    Specialities.push('Transfusion Medicine (Blood Bank)');
                                }
                                if (temp[index]['Urology'] == 'y') {
                                    Specialities.push('Urology');
                                }
                                if (temp[index]['Vascular Surgery'] == 'y') {
                                    Specialities.push('Vascular Surgery');
                                }

                                // Amenities Check
                                if (temp[index]['Air cooler'] == 'y') {
                                    Amenities.push('Air cooler');
                                }
                                if (temp[index]['Beds'] == 'y') {
                                    Amenities.push('Beds');
                                }
                                if (temp[index]['Bench for attendant'] == 'y') {
                                    Amenities.push('Bench for attendant');
                                }
                                if (temp[index]['Washroom'] == 'y') {
                                    Amenities.push('Washroom');
                                }
                                if (temp[index]['Air condition'] == 'y') {
                                    Amenities.push('Air condition');
                                }
                                if (temp[index]['Spacious, TV'] == 'y') {
                                    Amenities.push('Spacious, TV');
                                }
                                if (temp[index]['Wardrobe'] == 'y') {
                                    Amenities.push('Wardrobe');
                                }
                                if (temp[index]['Intercom'] == 'y') {
                                    Amenities.push('Intercom');
                                }
                                if (temp[index]['Nurse call bell'] == 'y') {
                                    Amenities.push('Nurse call bell');
                                }
                                if (temp[index]['Microwave'] == 'y') {
                                    Amenities.push('Microwave');
                                }
                                if (temp[index]['Refrigerator'] == 'y') {
                                    Amenities.push('Refrigerator');
                                }
                                if (temp[index]['Dining Table & chairs'] == 'y') {
                                    Amenities.push('Dining Table & chairs');
                                }
                                if (temp[index]['Separate bed for attendant stay'] == 'y') {
                                    Amenities.push('Separate bed for attendant stay');
                                }

                                // Saving Arrays to db names
                                temp[index].facilities = Facilities;
                                temp[index].specialities = Specialities;
                                temp[index].amenities = Amenities;

                                const newHospital = new verified_hospitals_schema(temp[index]);
                                await newHospital.save();
                                hospitalID++;
                                var hospitalname = temp[index].name;
                            }
                        }
                        fs.unlinkSync(req.body.filename);
                        res.status(200).json(hospitalname);
                    });
                }
            });
        } catch (error) {
            console.log(error);
        }
    },



    // Hospital Onboard
    // Created : 8-5-2021 Prayag
    OnBoardHospital: async (req, res, next) => {
        try {

            const { email, name, address, phone, slogan, logo, pincode, relationship, city, specialities, facilities, amenities } = req.body;

            var emailmessage = '';

            const isPresent = await verified_hospitals_schema.findOne({
                name: name,
            });
            if (isPresent) {
                res.status(200).json('exist');
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
                    city: city,
                    pincode: pincode,
                    relationship: relationship,
                    hospitalId: hospitalID,
                    password: hashpass,
                    hospitalLogo: logo,
                    specialities: specialities,
                    facilities: facilities,
                    amenities: amenities,
                });
                await newHospital.save();

                const CheckCity = await CitiesSchema.findOne({ city: city });
                if (!CheckCity) {
                    const City = await new CitiesSchema({ city: city }).save();
                }

                if (relationship == '2') {
                    var emailmessage = 'Dear Customer,\nPlease find below the ID for logging in hospitals.easyaspataal.com. Due to security reasons, we will not be sharing the password in this mail. Please use the forgot password option at hospitals.easyaspataal.com. A new password will be generated and sent to the registered email address.\n\n\n\n ID : ' + hospitalID + '\n\n\n\n\n\n\n Warm Regards,\n EasyAspataal Team';
                }
                else {
                    var emailmessage = 'Dear Customer,\nCongratulations! Your hospital has been successfully listed on our platform. You may visit easyaspataal.com and view your listing. Looking forward to bringing more business to you.\n\n\n\n\n\n Warm Regards,\n EasyAspataal Team';
                }

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
                    subject: 'Welcome aboard to EasyAspataal',
                    text: emailmessage,
                    // html: '<h1>Hello from gmail email using API</h1>',
                };

                transport.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

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

    // Delete Hospital
    // 21-5-2021 Prayag
    DeleteHospital: async (req, res) => {
        try {
            const { HospitalID } = req.body;
            verified_hospitals_schema.deleteOne({ _id: HospitalID }, function (err, DeleteCall) {
                if (!err)
                    console.log(DeleteCall);
            });
            res.status(200).json('Success');
        } catch (error) {
            console.log(error);
        }
    },


    // Edit Hospital
    // 26-5-2021 Prayag
    EditHospital: async (req, res) => {
        try {
            const { id, name, phone, email, address, city, pincode, relationship, rating, about, slogan, specialities, facilities, amenities } = req.body;
            verified_hospitals_schema.updateOne({ _id: id }, {
                name: name,
                phone1: phone,
                email: email,
                address: address,
                city: city,
                pincode: pincode,
                relationship: relationship,
                rating: rating,
                about: about,
                slogan: slogan,
                specialities: specialities,
                facilities: facilities,
                amenities: amenities,
            }, function (err, affected, resp) {
                console.log(resp);
            })
            res.status(200).json('Success');
        } catch (error) {
            console.log(error);
        }
    },


    // Delete Image
    // 28-5-2021 Prayag
    DeleteImage: async (req, res) => {
        try {
            const { name, filename } = req.body;

            const projectId = 'eamigrate';
            const keyFilename = 'src/configuration/private_bucket_keys.json';
            const PrivateBucket = new Storage({ projectId, keyFilename });
            const bucket = PrivateBucket.bucket('main_pvt');
            var file = bucket.file('hospitals/' + name + '/' + filename);
            file.delete();
            res.status(200).json('Success');
        } catch (error) {
            console.log(error);
        }
    },


    // Edit Logo
    // 28-5-2021 Prayag
    UpdateLogo: async (req, res) => {
        try {
            const { id, logo } = req.body;
            verified_hospitals_schema.updateOne({ _id: id }, {
                hospitalLogo: logo,
            }, function (err, affected, resp) {
                console.log(resp);
            })
            res.status(200).json('Success');
        } catch (error) {
            console.log(error);
        }
    },


    // Save Corporate Vaccination Slots
    // 11-6-2021 Prayag
    SaveVaccinationSlots: async (req, res) => {
        try {
            const { id, slots, venue1, venue2, pincode, enrolled, relationship } = req.body;

            const divided = enrolled / relationship;

            //Get Users
            const Users = await UsersSchema.findOne({ corporate_id: id });
            const range1 = Users.EID;
            var endrange = Number(range1.substring(2));

            for (let index = 0; index < slots.length; index++) {
                slots[index].start_range = 'EA' + endrange;
                var endrange = endrange + (divided - 1);
                slots[index].end_range = 'EA' + endrange;
                endrange++;
            }

            RequestVaccinationSchema.updateOne({ corporate_id: id }, {
                slots: slots,
                venue_address1: venue1,
                venue_address2: venue2,
                venue_pincode: pincode,
                status: 'in process'
            }, function (err, affected, resp) {
                console.log(resp);
            })
            res.status(200).json('Success');
        } catch (error) {
            console.log(error);
        }
    },


    // Send Vaccination Notifications
    // 11-6-2021 Prayag
    SendVaccinationNotifications: async (req, res) => {
        try {
            const { id, slots, venue1, venue2, pincode, email } = req.body;

            const UserArr = [];

            //Get all Users
            const Users = await UsersSchema.find({ corporate_id: id });
            for (let userindex = 0; userindex < Users.length; userindex++) {
                var neweid = Number(Users[userindex]['EID'].substring(2));
                UserArr.push({
                    EID: neweid,
                    cmobile: Users[userindex]['cmobile'],
                })
            }

            //Slots 
            for (let index = 0; index < slots.length; index++) {
                const startrange = slots[index].start_range;
                var fstart = Number(startrange.substring(2));
                const endrange = slots[index].end_range;
                var fend = Number(endrange.substring(2));

                for (let slotindex = fstart; slotindex <= fend; slotindex++) {
                    UserArr.map(function (slot) {
                        if (slot.EID == slotindex) {
                            // Send SMS with OTP 
                            const smsSend = SendSMS('123456', slot.cmobile);
                        }
                    });
                }
            }

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
                subject: 'Vaccination Update',
                text: 'Dear Corporate, \n\n The vaccination drive has been successfully scheduled for your employees. Please find the scheduling details below : \n\n ',
                // html: '<h1>Hello from gmail email using API</h1>',
            };

            transport.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.status(200).json('Success');
        } catch (error) {
            console.log(error);
        }
    },

    
AgreementJiraStatus: async (req, res) => {
        try {
            var { claim } = req.body;
            var data = JSON.stringify({
                "body": `Agreement signed`
              });
              var config = {
                method: 'post',
                url: 'https://easylos.atlassian.net/rest/api/2/issue/'+claim+'/comment',
                headers: {
                    'Authorization': 'Basic Y2hpcmFnQGVhc3lhc3BhdGFhbC5jb206RngzaHZOeXpzWmRQZjRNcmtzN0s5RUUw',
                    'Content-Type': 'application/json',
                    'Cookie': 'atlassian.xsrf.token=2320118d-6d73-4369-addd-eae328a4f16c_69b978ebc2f668f2b05972eca1046d919fefe3eb_lin'
                },
                data : data
              };
              axios(config)
              .then(function (response) {
                console.log('success');
              })
              .catch(function (error) {
                console.log(error);
              });
        } catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'error'
            }
            res.json(result);
        }
    }, 
    
    
    
    AgreementJiraStatusOnboard: async (req, res) => {
      
      try {
         
          var { onb } = req.body;
          var data = JSON.stringify({
              "body": `MOU signed`
            });
            
            var config = {
              method: 'post',
              url: 'https://easylos.atlassian.net/rest/api/2/issue/'+onb+'/comment',
              headers: {
                'Authorization': 'Basic cHJhdGlrQGVhc3lhc3BhdGFhbC5jb206bDkweHM3MEVIQTFhR2phSnhpUm8wMDQ5', 
                'Content-Type': 'application/json', 
                'Cookie': 'atlassian.xsrf.token=2320118d-6d73-4369-addd-eae328a4f16c_4c3856f95cf10d18c4a77f2566167049344d8601_lin'
              },
              data : data
            };
            axios(config)
            .then(function (response) {
              console.log('success');
            })
            .catch(function (error) {
              console.log(error);
            });
     
      } catch (err) {
          const result = {
              code: 400,
              status: false,
              message: 'error'
          }
          res.json(result);
      }
  },
    
// Jira Agreement Bitly link
    // 22-3-2021 Sampat    
BitlyJira: async (req, res) => {
      var { jiralink }= req.body
        try {
            var data = JSON.stringify({
              "long_url": `https://na4.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=c7d693f6-57d4-45c3-bef6-b052a6b39ee3&Customer_name=${req.body.name}&Application_name=${req.body.name}&Demand_promissory_amount1=${req.body.amount}&Demand_promissory_amount=${req.body.amount}&Demand_promissory_name=${req.body.name}&Applied_repayment_amount=${req.body.amount}&Personal_details_name=${req.body.name}&Personal_details_dob=${req.body.dob}&Personal_details_pan=${req.body.pan}&Personal_details_aadhar=${req.body.aadhar}&Contact_details_houseno=${req.body.address}&Contact_details_city=${req.body.city}&Contact_details_state=${req.body.state}&Contact_details_pin=${req.body.pin}&Bank_accountno=${req.body.account_no}&Bank_bankname=${req.body.bank_name}&Bank_accounttype=${req.body.account_type}&Bank_ifsc=${req.body.ifsc}&Disburse_dealer=${req.body.hospital_name}&Financing_amount=${req.body.amount}&claim_no=${req.body.key}`,
              "domain": "bit.ly",
              "group_guid": "Bla98d6KX93"
            });
            var config = {
              method: 'post',
              url: 'https://api-ssl.bitly.com/v4/shorten',
              headers: {
                'Authorization': 'Bearer 995be43e0b3de2519528ccd7c686ceb311643a52',
                'Content-Type': 'application/json'
              },
              data : data
            };
            axios(config)
            .then(function (response) {
              var linkshort = response.data.link;
              const result = {
                code: 200,
                status: true,
                message:linkshort
            }
            res.json(result);
            })
            .catch(function (error) {
              console.log(error);
            });
        } catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'error'
            }
            res.json(result);
        }
    },    

    
jiraContactVerify: async (req, res) => {
        try {
            var data = JSON.stringify({
              "fields": {
                "customfield_10417": "Mobile verified"
              }
            });
            var config = {
              method: 'put',
              url: 'https://easylos.atlassian.net/rest/api/3/issue/'+req.query.claim,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Basic Y2hpcmFnQGVhc3lhc3BhdGFhbC5jb206RngzaHZOeXpzWmRQZjRNcmtzN0s5RUUw',
                'Cookie': 'atlassian.xsrf.token=2320118d-6d73-4369-addd-eae328a4f16c_37e5682debed8925156bbcc30aca09e307b0ef4d_lin'
              },
              data : data
            };
            axios(config)
            .then(function (response) {
              const result = {
                code: 200,
                status: true,
                message: 'sucess'
            }
            res.json(result);
            })
            .catch(function (error) {
              console.log(error);
            });
        } catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'error'
            }
            res.json(result);
        }
    },   
    
    
    
    BitlyJiraOnboard: async (req, res) => {
        
        try {
            
            var data = JSON.stringify({
              "long_url": `https://na4.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=dbb722d6-4ea6-4e2f-a6e5-1045f8f56c57&hos_name=${req.body.hospital_name}&hospital_name=${req.body.hospital_name}&payee_name=${req.body.payee_name}&ifsc_code=${req.body.ifsc_code}&acnt_no=${req.body.acnt_no}&bank_branch=${req.body.bank_branch}&bank_name=${req.body.bank_name}&ipd=${req.body.ipd}&opd=${req.body.opd}&insuremb=${req.body.insuremb}`,
              "domain": "bit.ly",
              "group_guid": "Bla98d6KX93"
            });
            
            var config = {
              method: 'post',
              url: 'https://api-ssl.bitly.com/v4/shorten',
              headers: { 
                'Authorization': 'Bearer 995be43e0b3de2519528ccd7c686ceb311643a52', 
                'Content-Type': 'application/json'
              },
              data : data
            };
            
            axios(config)
            .then(function (response) {
              var linkshort = response.data.link;
              const result = {
                code: 200,
                status: true,
                message:linkshort
            }
        
            res.json(result);
            })
            .catch(function (error) {
              console.log(error);
            });
            
       
        } catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'error'
            }
            res.json(result);
        }
    },
    
    
BitlyJiraAtl: async (req, res) => {
        console.log(req.body)
      var { jiralink }= req.body
        try {
            var data = JSON.stringify({
              "long_url": `https://na4.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=8fa0de82-3885-4416-9cf2-432f0502f09e&Customer_name=${req.body.name}&Application_name=${req.body.name}&Demand_promissory_amount1=${req.body.amount}&Demand_promissory_amount=${req.body.amount}&Demand_promissory_name=${req.body.name}&Applied_repayment_amount=${req.body.amount}&Personal_details_name=${req.body.name}&Personal_details_dob=${req.body.dob}&Personal_details_pan=${req.body.pan}&Personal_details_aadhar=${req.body.aadhar}&Contact_details_houseno=${req.body.address}&Contact_details_city=${req.body.city}&Contact_details_state=${req.body.state}&Contact_details_pin=${req.body.pin}&Bank_accountno=${req.body.account_no}&Bank_bankname=${req.body.bank_name}&Bank_accounttype=${req.body.account_type}&Bank_ifsc=${req.body.ifsc}&Disburse_dealer=${req.body.hospital_name}&Financing_amount=${req.body.amount}&claim_no=${req.body.key}`,
              "domain": "bit.ly",
              "group_guid": "Bla98d6KX93"
            });
            var config = {
              method: 'post',
              url: 'https://api-ssl.bitly.com/v4/shorten',
              headers: {
                'Authorization': 'Bearer 995be43e0b3de2519528ccd7c686ceb311643a52',
                'Content-Type': 'application/json'
              },
              data : data
            };
            axios(config)
            .then(function (response) {
              var linkshort = response.data.link;
              const result = {
                code: 200,
                status: true,
                message:linkshort
            }
            console.log(result);
            res.json(result);
            })
            .catch(function (error) {
              console.log(error);
            });
        } catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'error'
            }
            res.json(result);
        }
    }, 
    
    jiraEmailVerify: async (req, res) => {
       
        try {
        
            var data = JSON.stringify({
              "fields": {
                "customfield_10418":"Email Verified"
              }
            });
           
            var config = {
              method: 'put',
              url: 'https://easylos.atlassian.net/rest/api/3/issue/'+req.query.claim,
              headers: { 
                'Accept': 'application/json', 
                'Content-Type': 'application/json', 
                'Authorization': 'Basic Y2hpcmFnQGVhc3lhc3BhdGFhbC5jb206RngzaHZOeXpzWmRQZjRNcmtzN0s5RUUw', 
                'Cookie': 'atlassian.xsrf.token=2320118d-6d73-4369-addd-eae328a4f16c_37e5682debed8925156bbcc30aca09e307b0ef4d_lin'
              },
              data : data
            };
            
            axios(config)
            .then(function (response) {
              
              const result = {
                code: 200,
                status: true,
                message: 'sucess'
            }
            res.json(result);

            })
            .catch(function (error) {
              console.log(error);
            });
             
       
        } catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'error'
            }
            res.json(result);
        }
    },
    
    Emailotp: async (req, res) => {
        try {
            var digits = '0123456789';
            var OTP = '';
            for (let i = 0; i < 4; i++ ) {
                OTP += digits[Math.floor(Math.random() * 10)];
            }
           
            
            OtpEmail(req.query.email, 'OTP', OTP);
            const result = {
                code: 200,
                status: true,
                message: OTP
            }
            res.json(result);
            
        
        } catch (error) {
            const result = {
                code: 400,
                status: false,
                message: error
            }
            res.json(result);
            console.log(error);
        }
    },
    
    
    WixJiraOnboarding: async (req, res) => {
      
        try {
            console.log(req.body)
            var data = JSON.stringify({
                "fields": {
                  "customfield_10473": req.body.rohini_id,
                    "customfield_10474": req.body.gstn_details,
                    "customfield_10475": req.body.year_of_incorp,
                    "customfield_10476": req.body.owners_name,
                    "customfield_10477": req.body.owners_number,
                    "customfield_10478": req.body.owners_email,
                    "customfield_10479": req.body.owners_aadhar,
                    "customfield_10480": req.body.owners_pan,
                  "customfield_10321": req.body.bank_name,
                  "customfield_10320": req.body.acnt_no,
                  "customfield_10322": req.body.ifsc,
                  "customfield_10323": req.body.payee,
                  "customfield_10493": req.body.branchname,
                  "customfield_10067": req.body.hosname,
                  "customfield_10319": req.body.addr,
                  "project": {
                    "key": "ONB"
                  },
                  "summary": "HOSPITAL ONBOARDING",
                  "issuetype": {
                    "name": "Task"
                  }
                }
              });
              
              var config = {
                method: 'post',
                url: 'https://easylos.atlassian.net/rest/api/2/issue/',
                headers: { 
                  'Authorization': 'Basic cHJhdGlrQGVhc3lhc3BhdGFhbC5jb206bDkweHM3MEVIQTFhR2phSnhpUm8wMDQ5', 
                  'Content-Type': 'application/json', 
                  'Cookie': 'atlassian.xsrf.token=2320118d-6d73-4369-addd-eae328a4f16c_4c3856f95cf10d18c4a77f2566167049344d8601_lin'
                },
                data : data
              };
              
              axios(config)
              .then(function (response) {
                const result = {
                    code: 200,
                    status: true,
                    message: response.data.key
                }

                res.json(result);
              })
              .catch(function (error) {
                console.log(error);
              });
              
       
        } catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'error'
            }
            res.json(result);
        }
    },
};
