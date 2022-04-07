/* ----------------- This File Saves Request from Homepage ----------------- */
/* ----------------- Created : 27-4-2021 by Prayag ----------------- */
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const moment = require('moment');
const { google } = require('googleapis');
const SendSMS = require('../../../third_party/sms');
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
const EstimateRequestsSchema = require("../../../models/requests-schema");
const UsersSchema = require('../../../models/users');
const EasyLoanSchema = require("../../../models/requests-easyloan");
const EstimationSchema = require("../../../models/requests-estimation");
const ReferralSchema = require("../../../models/requests-referral");
/* ------------------------------------------------------------------------------------------------------------------ */

module.exports = {
    // Create new request
    // 27-4-2021 Prayag
    CreateRequest: async (req, res) => {
        try {
            const { name, mobile, pincode, surgery, treatment, referal, amount, budget, type, rfor } = req.body;

            var emaildate = moment(new Date()).format("DD/MM/YYYY h:mm");

            const CheckUser = await UsersSchema.countDocuments({ mobile: mobile });

            // If new user
            if (CheckUser == 0) {
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
                const saveuser = new UsersSchema({
                    name: name,
                    mobile: mobile,
                    pincode: pincode,
                    EID: 'EA' + eid,
                    relation: 'self',
                    otp_verified: true,
                    kyc_verified: false,
                    from: 'ui',
                });
                const UserDetails = await saveuser.save();

                if (type == 'estimation') {
                    const saverequest = new EstimationSchema({
                        EID: 'EA' + eid,
                        status: 'pending',
                        treatment: treatment,
                        from: 'ui',
                    });
                    const savedRequestDetails = await saverequest.save();
                }
                else if (type == 'easyloan') {
                    const saverequest = new EasyLoanSchema({
                        EID: 'EA' + eid,
                        loan_required: amount,
                        budget: budget,
                        status: 'pending',
                        surgery: surgery,
                        from: 'ui',
                    });
                    const savedRequestDetails = await saverequest.save();
                }
                else if (type == 'referral') {
                    const saverequest = new ReferralSchema({
                        EID: 'EA' + eid,
                        referral_name: referal,
                        for: rfor,
                        status: 'pending',
                        from: 'ui',
                    });
                    const savedRequestDetails = await saverequest.save();
                }
            }

            // Existing User
            else {
                const User = await UsersSchema.findOne({ mobile: mobile });
                if (type == 'estimation') {
                    const saverequest = new EstimationSchema({
                        EID: User.EID,
                        status: 'pending',
                        treatment: treatment,
                        from: 'ui',
                    });
                    const savedRequestDetails = await saverequest.save();
                }
                else if (type == 'easyloan') {
                    const saverequest = new EasyLoanSchema({
                        EID: User.EID,
                        loan_required: amount,
                        budget: budget,
                        status: 'pending',
                        surgery: surgery,
                        from: 'ui',
                    });
                    const savedRequestDetails = await saverequest.save();
                }
                else if (type == 'referral') {
                    const saverequest = new ReferralSchema({
                        EID: User.EID,
                        referral_name: referal,
                        for: rfor,
                        status: 'pending',
                        from: 'ui',
                    });
                    const savedRequestDetails = await saverequest.save();
                }
            }

            if (type === 'estimation') {
                var emailcontent = '\nName : ' + name + '\nMobile : ' + mobile + '\nPincode : ' + pincode + '\nType : ' + type + '\nTreatment : ' + treatment;
            }
            else if (type === 'surgery') {
                var emailcontent = '\nName : ' + name + '\nMobile : ' + mobile + '\nPincode : ' + pincode + '\nType : ' + type + '\nSurgery : ' + surgery;
            }
            else if (type === 'easyloan') {
                var emailcontent = '\nName : ' + name + '\nMobile : ' + mobile + '\nPincode : ' + pincode + '\nType : ' + type + '\nLoan Amount : ' + amount + '\nBudget : ' + budget;
            }
            else {
                var emailcontent = '\nName : ' + name + '\nMobile : ' + mobile + '\nPincode : ' + pincode + '\nType : ' + type + '\nReferral Name : ' + referal + '\nFor : ' + rfor;
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

            //const mailOptions = {
            //    from: 'info@easyaspataal.com',
            //    to: 'info@easyaspataal.com',
            //    subject: '[' + type + '] Request by ' + name + ' on ' + emaildate,
            //    text: 'We have received a request: The details are as follows: \n' + emailcontent + '\n\nThis email has been generated by a bot.'
            //    // html: '<h1>Hello from gmail email using API</h1>',
            //};

            //transport.sendMail(mailOptions, function (error, info) {
            //    if (error) {
            //        console.log(error);
            //    } else {
            //        console.log('Email sent: ' + info.response);
            //    }
            //});
            res.json('Success')
        } catch (error) {
            console.log(error);
        }
    },


    // Send OTP SMS
    // 21-6-2021 Prayag
    SendOTP: async (req, res) => {
        try {
            const { mobile, otp } = req.body;

            const CheckUser = await UsersSchema.countDocuments({ mobile: mobile });

            if (CheckUser == 0) {
                const CheckEmployee = await UsersSchema.countDocuments({ cmobile: mobile });
                if (CheckEmployee == 0) {
                    // Send SMS with OTP 
                    const smsSend = SendSMS(otp, mobile);
                    const result = {
                        code: 200,
                        status: true,
                        message: 'OTP sent'
                    }
                    res.json(result);
                }
                else {
                    const result = {
                        code: 400,
                        status: false,
                        message: 'User exists'
                    }
                    res.json(result);
                }
            }
            else {
                const result = {
                    code: 400,
                    status: false,
                    message: 'User exists'
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
