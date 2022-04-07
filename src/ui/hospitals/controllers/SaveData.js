/* ----------------- This File Saves Request from Homepage ----------------- */
/* ----------------- Created : 27-4-2021 by Prayag ----------------- */
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const moment = require('moment');
const { google } = require('googleapis');
const SendSMS = require('../../../third_party/sms');
const SendEmail = require('../../../third_party/email');
/* -------------------------------------------------- Requirements -------------------------------------------------- */


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



/* -------------------------------------------------- Schemas -------------------------------------------------- */
const UsersSchema = require('../../../models/users');
const RequestEstimateSchema = require("../../../models/requests-estimation");
const RequestKYCSchema = require("../../../models/requests-kyc");
const EDeskSchema = require("../../../models/edesk");
const PreAuthSchema = require("../../../models/pre-auth");
const PaymentSchema = require("../../../models/payments");
const HospitalSchema = require("../../../models/new_hospitals");
/* ------------------------------------------------------------------------------------------------------------------ */

module.exports = {

    // Register User
    // 7-9-2021 Prayag
    RegisterUser: async (req, res) => {
        try {
            const { name, email, address, eid, age, HID, reason } = req.body;

            const HospitalData = await HospitalSchema.findOne({ HID: HID });
            const UsersData = await UsersSchema.findOne({ EID: eid });

            //Update Users
            await UsersSchema.updateOne({ EID: eid }, {
                name: name,
                age: age,
                email: email,
                address_line1: address,
                from: 'qr',
            }, async function (err, affected, resp) {
                //Save E-Desk
                const CheckEDesk = await EDeskSchema.countDocuments({ EID: eid });
                if (CheckEDesk == 0) {
                    const edesk = new EDeskSchema({
                        userId: UsersData._id,
                        hospitalId: HospitalData._id,
                        EID: eid,
                        HID: HID,
                        from: 'qr'
                    });
                    const savedEDeskDetails = await edesk.save();
                }
                // Send Email to Hospital
                const Subject = 'Patient Onboard';
                const Message = 'Dear ' + HospitalData.name + ',\n\n Patient with below details has been successfully E-registered with your hospital \n \n Name: ' + name + '\nPurpose: ' + reason + '\n\n\n\n\n\n Warm Regards,\n EasyAspataal Team';
                const EmailSend = await SendEmail(HospitalData.email, Subject, Message);

                const result = {
                    code: 200,
                    status: true,
                    message: 'User saved successfully'
                }
                res.json(result);
            })
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


    // Easy Finance
    // 7-9-2021 Prayag
    EasyFinance: async (req, res) => {
        try {

            const { name, email, address, eid, age, HID, surgery, cost, city, insurance, pan, aadharno, aadharimg } = req.body;

            const HospitalData = await HospitalSchema.findOne({ HID: HID });
            const UsersData = await UsersSchema.findOne({ EID: eid });

            await UsersSchema.updateOne({ EID: eid }, {
                name: name,
                age: age,
                email: email,
                from: 'qr',
            }, async function (err, affected, resp) {
                // Save Estimate
                const saveestimate = new RequestEstimateSchema({
                    EID: eid,
                    treatment: surgery,
                    budget: cost,
                    finance: true,
                    insurance: insurance,
                    city: city,
                    status: 'pending',
                    from: 'qr'
                });
                await saveestimate.save();

                //Save EDesk                    
                const CheckEDesk = await EDeskSchema.countDocuments({ EID: eid });
                if (CheckEDesk > 0) {
                    EDeskSchema.updateOne({ EID: eid }, {
                        requestInitiated: {
                            finance: true,
                        },
                    }, async function (err, affected, resp) {
                        // Send Email to Hospital
                        const Subject = 'Patient Onboard';
                        const Message = 'Dear ' + HospitalData.name + ',\n\n Patient with below details has requested for Easy Finance with your hospital \n \n Name: ' + name + '\nEmail: ' + email + '\n\n\n\n\n\n Warm Regards,\n EasyAspataal Team';
                        const EmailSend = await SendEmail(HospitalData.email, Subject, Message);

                        RequestKYCSchema.updateOne({ EID: eid }, {
                            pan: pan,
                            aadhar_no: aadharno,
                            aadhar_img: aadharimg,
                            status: 'in_process',
                            from: 'ui',
                        }, function (err, affected, resp) {
                            const result = {
                                code: 200,
                                status: true,
                                message: 'Details saved successfully'
                            }
                            res.json(result);
                        })
                    })
                }
                else {
                    const edesk = new EDeskSchema({
                        userId: UsersData._id,
                        hospitalId: HospitalData._id,
                        requestInitiated: {
                            finance: true,
                        },
                        EID: eid,
                        HID: HID,
                        from: 'qr'
                    });
                    await edesk.save();
                }

                // Send Email to Hospital
                const Subject = 'Patient Onboard';
                const Message = 'Dear ' + HospitalData.name + ',\n\n Patient with below details has requested for Easy Finance with your hospital \n \n Name: ' + name + '\nEmail: ' + email + '\n\n\n\n\n\n Warm Regards,\n EasyAspataal Team';
                const EmailSend = await SendEmail(HospitalData.email, Subject, Message);

                RequestKYCSchema.updateOne({ EID: eid }, {
                    pan: pan,
                    aadhar_no: aadharno,
                    status: 'in_process',
                    from: 'ui',
                }, function (err, affected, resp) {
                    const result = {
                        code: 200,
                        status: true,
                        message: 'Details saved successfully'
                    }
                    res.json(result);
                })
            })
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



    // Save PreAuth
    // 7-9-2021 Prayag
    SavePreAuth: async (req, res) => {
        try {

            const { name, aadharno, eid, insuranceNo, insuranceName, insured, HID, insuranceimg } = req.body;

            const HospitalData = await HospitalSchema.findOne({ HID: HID });
            const UsersData = await UsersSchema.findOne({ EID: eid });

            //Update Profile
            await UsersSchema.updateOne({ EID: eid }, {
                name: name,
                from: 'qr',
            }, async function (err, affected, resp) {
                //Update KYC
                await RequestKYCSchema.updateOne({ EID: eid }, {
                    aadhar_no: aadharno,
                    status: 'in_process',
                    from: 'qr',
                }, async function (err, affected, resp) {
                    //Save PreAuth
                    const PreAuthIDNo = await PreAuthSchema.aggregate([
                        { $sort: { '_id': -1 } },
                        { $limit: 1 },
                        {
                            $project: {
                                PID: 1.0,
                            }
                        },
                    ]);
                    var preauthid = PreAuthIDNo[0].PID;
                    var pid = Number(preauthid.substring(2)) + 1;

                    const savepreauth = new PreAuthSchema({
                        PID: 'PA100005',
                        HID: HID,
                        EID: eid,
                        userId: UsersData._id,
                        insuredCardIdNumber: insuranceNo,
                        insurer: insuranceName,
                        insurance_img: insuranceimg,
                        from: 'qr',
                    });
                    await savepreauth.save();

                    //Save EDesk                    
                    const edesk = new EDeskSchema({
                        EID: eid,
                        HID: HID,
                        requestInitiated: {
                            pre_auth: true,
                        },
                        userId: UsersData._id,
                        hospitalId: HospitalData._id,
                        from: 'qr'
                    });
                    await edesk.save();

                    // Send Email to Hospital
                    const Subject = 'Patient Onboard';
                    const Message = 'Dear ' + HospitalData.name + ',\n\n Patient with below details has requested for Pre-Auth with your hospital \n \n Name: ' + name + '\n\n\n\n\n\n Warm Regards,\n EasyAspataal Team';
                    const EmailSend = await SendEmail(HospitalData.email, Subject, Message);

                    const result = {
                        code: 200,
                        status: true,
                        message: 'Details saved successfully'
                    }
                    res.json(result);
                })
            })
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


    // Send OTP SMS
    // 7-9-2021 Prayag
    SendOTP: async (req, res) => {
        try {
            const { mobile, otp } = req.body;

            const CheckUser = await UsersSchema.countDocuments({ mobile: mobile });

            if (CheckUser == 0) {

                const CheckCorpUser = await UsersSchema.countDocuments({ cmobile: mobile });

                if (CheckCorpUser == 0) {
                    //Send OTP
                    const smsSend = await SendSMS(otp, mobile);

                    //Add User
                    const EmployeeID = await UsersSchema.aggregate([
                        { $sort: { '_id': -1 } },
                        { $limit: 1 },
                        {
                            $project: {
                                EID: 1.0,
                            }
                        },
                    ]);
                    var userid = EmployeeID[0].EID;
                    var eid = Number(userid.substring(2)) + 1;

                    //Update Relation in User
                    const relationArr = {
                        EID: 'EA' + eid,
                        relation: 'self',
                    };

                    const saveuser = new UsersSchema({
                        mobile: mobile,
                        EID: 'EA' + eid,
                        relation: 'self',
                        otp_verified: true,
                        kyc_verified: false,
                        from: 'qr',
                        relations: relationArr,
                    });
                    const UserDetails = await saveuser.save();

                    // KYC Save
                    const newKYC = new RequestKYCSchema({
                        EID: 'EA' + eid,
                        from: 'qr',
                        status: 'pending',
                    });
                    await newKYC.save();

                    const result = {
                        code: 200,
                        status: true,
                        message: {
                            type: 'new',
                            UserData: 'EA' + eid,
                        }
                    }
                    res.json(result);
                }
                else {
                    const UserData = await UsersSchema.findOne({ cmobile: mobile });
                    const result = {
                        code: 200,
                        status: true,
                        message: {
                            type: 'exist',
                            UserData: UserData,
                        }
                    }
                    res.json(result);
                }
            }
            else {
                const UserData = await UsersSchema.findOne({ mobile: mobile });
                const result = {
                    code: 200,
                    status: true,
                    message: {
                        type: 'exist',
                        UserData: UserData,
                    }
                }
                res.json(result);
            }
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



};
