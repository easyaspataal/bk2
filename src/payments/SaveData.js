/* ----------------- This File Saves Data from Corporate ----------------- */
/* ----------------- Created : 29-7-2021 by Prayag ----------------- */
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const jwt = require("jsonwebtoken");
const fs = require('fs');
const bcrypt = require("bcryptjs");
const reader = require('xlsx');
const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv').config();
const axios = require('axios');
const Razorpay = require('razorpay');
const shortid = require('shortid');
const razorpay = new Razorpay({ key_id: process.env.RazorPay_KeyId, key_secret: process.env.RazorPay_KeySecret });
const SendEmail = require('../third_party/email');
const SendPaymentSMS = require('../third_party/payment_sms');
const SendPaymentWhatsapp = require('../third_party/whatsapp_payment');
const qs = require('qs');
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Schemas -------------------------------------------------- */
const PaymentSchema = require("../models/payments");
const HospitalSchema = require("../models/new_hospitals");
const UsersSchema = require('../models/users');
const RequestEstimateSchema = require("../models/requests-estimation");
const RequestKYCSchema = require("../models/requests-kyc");
const EDeskSchema = require("../models/edesk");
const PreAuthSchema = require("../models/pre-auth");
/* ------------------------------------------------------------------------------------------------------------------ */


module.exports = {

    // Inhouse 599/- EA
    // 8-2-2021 Sampat    
UpdateJiraStatus: async (req, res) => {
        try {
            var { patient, claim} = req.body;
            var data = JSON.stringify({
                "body": `Rs.599/- Payment done successfully by ${patient}`
              });
              var config = {
                method: 'post',
                url: 'https://easylos.atlassian.net/rest/api/2/issue/CLAIM-'+claim+'/comment',
                headers: {
                    'Authorization': 'Basic Y2hpcmFnQGVhc3lhc3BhdGFhbC5jb206RngzaHZOeXpzWmRQZjRNcmtzN0s5RUUw',
                    'Content-Type': 'application/json',
                    'Cookie': 'atlassian.xsrf.token=2320118d-6d73-4369-addd-eae328a4f16c_69b978ebc2f668f2b05972eca1046d919fefe3eb_lin'
                },
                data : data
              };
              axios(config)
              .then(function (response) {
            const result = {
                code: 200,
                status: true,
                message: 'Success'
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
    
    
    // Check Sales Admin User
    // 3-8-2021 Prayag
    InitiatePayment: async (req, res) => {
        const payment_capture = 1;
        const amount = req.body.amount;
        const currency = 'INR';
        if (req.body.name === "EasyAspataal") {
            var options = {
                amount: amount * 100,
                currency,
                receipt: shortid.generate(),
                notes: {
                    Claim_no: req.body.claim,
                    Patient_name: req.body.patient
                },

                transfers: [
                    {
                        account: req.body.accountid,
                        amount: amount * 100,
                        currency: "INR",
                    }
                ]

            }
        } else {
            var options = {
                amount: amount * 100,
                currency,
                receipt: shortid.generate(),
                transfers: [
                    {
                        account: req.body.accountid,
                        amount: amount * 100,
                        currency: "INR",
                    }
                ]

            }
        }
        try {
            const response = await razorpay.orders.create(options);

            const HospitalData = await HospitalSchema.findOne({ HID: req.body.HID });

            const CheckUser = await UsersSchema.countDocuments({ mobile: req.body.contact });

            if (CheckUser == 0) {
                const CheckCorpUser = await UsersSchema.countDocuments({ cmobile: req.body.contact });
                if (CheckCorpUser == 0) {
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
                        mobile: req.body.contact,
                        name: req.body.name,
                        email: req.body.email,
                        EID: 'EA' + eid,
                        relation: 'self',
                        otp_verified: true,
                        kyc_verified: false,
                        from: 'qr',
                        relations: relationArr,
                    });
                    var UserDetails = await saveuser.save();

                    // KYC Save
                    const newKYC = new RequestKYCSchema({
                        EID: 'EA' + eid,
                        from: 'qr',
                        status: 'pending',
                    });
                    await newKYC.save();
                    var feid = 'EA' + eid;
                }
                else {
                    var UserDetails = await UsersSchema.findOne({ cmobile: req.body.contact });
                    var feid = UserDetails.EID;
                }
            }
            else {
                var UserDetails = await UsersSchema.findOne({ mobile: req.body.contact });
                var feid = UserDetails.EID;
            }

            //Save EDesk                    
            const CheckDesk = await EDeskSchema.countDocuments({ EID: feid });
            if (CheckDesk == 0) {
                const edesk = new EDeskSchema({
                    EID: feid,
                    HID: req.body.HID,
                    requestInitiated: {
                        payment: true,
                    },
                    userId: UserDetails._id,
                    hospitalId: HospitalData._id,
                    from: 'qr'
                });
                await edesk.save();

                const result = {
                    code: 200,
                    status: true,
                    message: {
                        id: response.id,
                        currency: response.currency,
                        amount: response.amount,
                        EID: feid,
                    }
                }
                res.json(result);
            }
            else {
                EDeskSchema.updateOne({ EID: feid }, {
                    requestInitiated: {
                        payment: true,
                    },
                    from: 'qr',
                }, function (err, affected, resp) {
                    const result = {
                        code: 200,
                        status: true,
                        message: {
                            id: response.id,
                            currency: response.currency,
                            amount: response.amount,
                            EID: feid,
                        }
                    }
                    res.json(result);
                })
            }
        } catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'error'
            }
            res.json(result);
            console.log(err)
        }
    },


    // Split Payment
    // 20-10-2021 Prayag
    SplitPayment: async (req, res) => {
        try {

            const { paymentid, reason, eid, HID, name, email, contact } = req.body;

            const CheckUser = await UsersSchema.countDocuments({ mobile: contact });
            const HospitalData = await HospitalSchema.findOne({ HID: HID });

            const data = {
                "amount": req.body.amount * 100,
                "currency": "INR",
                "accept_partial": true,
                "customer": {
                    "name": req.body.name,
                    "contact": req.body.contact,
                    "email": req.body.email
                },
                "notify": {
                    "sms": true,
                    "email": true
                },
                "reminder_enable": true,
            }

            const baseUrl = "https://api.razorpay.com/v1/payment_links";
            let b64Str = Buffer.from(
                `${process.env.RazorPay_KeyId}:${process.env.RazorPay_KeySecret}`
            ).toString("base64");
            let postAxios = await axios({
                method: "post",
                url: baseUrl,
                data: data,
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Basic ${b64Str}`,
                },
            });

            // Send Email to Hospital
            const Subject = 'Patient Payment';
            const Message = 'Dear ' + HospitalData.name + ',<br /><br />A payment with below details has been successfully initiated.<br/><br/><div align="center" style="background-color: blue"> <div align="center"> <br /> <h3 style="color: white; font-size:22px; font-weight: bold">LIFEBOX TECHNOLOGIES PRIVATE LIMITED</h3></div> <br /> </div> </div> <div align="center"> <p style="font-size:30px"><b>₹' + req.body.amount + '<b/><br/><span style="font-size:16px">Initiated Succesfully</span> <hr style="width:70%" /></p> </div> <div align="center"> <br /><br /> <br /><br /> </div> <br /><br /> <br /><br /><br /><br /> <div align="center"> <div> <hr style="width:70%" /> <span>For any order related queries, please reach out to LIFEBOX TECHNOLOGIES PRIVATE LIMITED .</span> </div> <br /> </div>';
            const EmailSend = await SendEmail(HospitalData.email, Subject, Message);

            // Send Email Internally
            const SubjectInt = 'Hospital Split Payments';
            const MessageInt = 'Hi Team,\n\n' + HospitalData.name + ' split payment initiated by ' + req.body.contact + ' for Rs.' + req.body.amount;
            const EmailSendInt = await SendEmail('hospitals@easyaspataal.com', SubjectInt, MessageInt);

            if (CheckUser == 0) {
                const CheckUserCorp = await UsersSchema.countDocuments({ cmobile: contact });
                if (CheckUserCorp == 0) {
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
                    var feid = Number(userid.substring(2)) + 1;

                    //Update Relation in User
                    const relationArr = {
                        EID: 'EA' + feid,
                        relation: 'self',
                    };

                    const saveuser = new UsersSchema({
                        mobile: req.body.contact,
                        name: req.body.name,
                        email: req.body.email,
                        EID: 'EA' + feid,
                        relation: 'self',
                        otp_verified: true,
                        kyc_verified: false,
                        from: 'qr',
                        relations: relationArr,
                    });
                    var UserDetails = await saveuser.save();

                    // KYC Save
                    const newKYC = new RequestKYCSchema({
                        EID: 'EA' + feid,
                        from: 'qr',
                        status: 'pending',
                    });
                    await newKYC.save();
                }
                else {
                    var UserDetails = await UsersSchema.findOne({ cmobile: contact });
                }
            }
            else {
                var UserDetails = await UsersSchema.findOne({ mobile: contact });
            }

            // Payment Save
            const PaymentID = await PaymentSchema.aggregate([
                { $sort: { '_id': -1 } },
                { $limit: 1 },
                {
                    $project: {
                        paymentId: 1.0,
                    }
                },
            ]);
            var newpaymentid = PaymentID[0].paymentId;
            var pid = Number(newpaymentid.substring(2)) + 1;

            const newPayment = new PaymentSchema({
                EID: UserDetails.EID,
                HID: HID,
                paymentId: 'PY' + pid,
                amount: req.body.amount,
                userId: UserDetails._id,
                hospitalId: HospitalData._id,
                razorpayPaymentLink: postAxios.data.short_url
            });
            await newPayment.save();

            //Save EDesk                    
            const CheckDesk = await EDeskSchema.countDocuments({ EID: UserDetails.EID });
            if (CheckDesk == 0) {
                const edesk = new EDeskSchema({
                    EID: UserDetails.EID,
                    HID: HID,
                    requestInitiated: {
                        payment: true,
                    },
                    userId: UserDetails._id,
                    hospitalId: HospitalData._id,
                    from: 'qr'
                });
                await edesk.save();

                const result = {
                    code: 200,
                    status: true,
                    message: postAxios.data.short_url,
                }
                res.json(result);
            }
            else {
                EDeskSchema.updateOne({ EID: UserDetails.EID }, {
                    requestInitiated: {
                        payment: true,
                    },
                    from: 'qr',
                }, function (err, affected, resp) {
                    const result = {
                        code: 200,
                        status: true,
                        message: postAxios.data.short_url,
                    }
                    res.json(result);
                })
            }
        } catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'Something went wrong'
            }
            res.json(result);
            console.log(err)
        }
    },


    // Save Payment
    // 26-10-2021 Prayag
    SavePayment: async (req, res) => {
        try {
            const { amount, paymentid, orderid, signature, reason, eid, HID, contact, notification } = req.body;

            const UserData = await UsersSchema.findOne({ EID: eid });
            const HospitalData = await HospitalSchema.findOne({ HID: HID });

            // Payment Save
            const PaymentID = await PaymentSchema.aggregate([
                { $sort: { '_id': -1 } },
                { $limit: 1 },
                {
                    $project: {
                        paymentId: 1.0,
                    }
                },
            ]);
            var newpaymentid = PaymentID[0].paymentId;
            var pid = Number(newpaymentid.substring(2)) + 1;

            const newPayment = new PaymentSchema({
                EID: eid,
                HID: HID,
                paymentId: 'PY' + pid,
                amount: amount,
                reason: reason,
                order_id: orderid,
                userId: UserData._id,
                hospitalId: HospitalData._id,
                razorpayOrderId: orderid,
                razorpayPaymentId: paymentid,
                razorpaySignature: signature,
                from: 'qr',
                status: 'Complete',
            });
            await newPayment.save();

            //Send Whatsapp
            if (notification == true) {
                const WhatsappSend = await SendPaymentWhatsapp(contact, amount, paymentid);
            }

            //Send SMS
            const transaction = Math.floor(Math.random() * 1000000000);
            const smsSend = await SendPaymentSMS(Number(HospitalData.contact), Number(amount), transaction);

            // Send Email to Hospital
            const Subject = 'Patient Payment';
            const Message = 'Dear ' + HospitalData.name + ',<br /><br />A payment with below details has been successfully initiated.It will reflect in your account on T+1<br/><br/><div align="center" style="background-color: blue"> <div align="center"> <br /> <h3 style="color: white; font-size:22px; font-weight: bold">LIFEBOX TECHNOLOGIES PRIVATE LIMITED</h3></div> <br /> </div> </div> <div align="center"> <p style="font-size:30px"><b>₹' + amount + '<b/><br/><span style="font-size:16px">Initiated Succesfully</span> <hr style="width:70%" /></p> </div> <div align="center"> <div > <span style="font-size:16px" ><b style="font-size:18px" >Order Id</b> : ' + orderid + '</span> </div> <br /><div > <span style="font-size:16px" ><b style="font-size:18px" >Payment Id</b> : ' + paymentid + '</span> </div><br /><br /><br /> </div> <br /><br /> <br /><br /><br /><br /> <div align="center"> <div> <hr style="width:70%" /> <span>For any order related queries, please reach out to LIFEBOX TECHNOLOGIES PRIVATE LIMITED .</span> </div> <br /> </div>';
            const EmailSend = await SendEmail(HospitalData.email, Subject, Message);

            // Send Email Internally
            const SubjectInt = 'Hospital Direct Transfer Payments';
            const MessageInt = 'Hi Team,\n\n' + HospitalData.name + ' normal payment initiated by ' + contact + ' for Rs.' + amount + ' with order ID ' + orderid;
            const EmailSendInt = await SendEmail('hospitals@easyaspataal.com', SubjectInt, MessageInt);

            const result = {
                code: 200,
                status: true,
                message: 'Success'
            }
            res.json(result);
        } catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'Something went wrong'
            }
            res.json(result);
            console.log(err)
        }
    },


    // Go Cashless 
    // 24-11-2021 Prayag
    GoCashlessEmail: async (req, res) => {
        try {
            const { hospitalname } = req.body;

            // Send Email Internally
            const SubjectInt = 'Go Cashless Request';
            const MessageInt = 'Hi Team,\n\n A Go Cashless Service has been initiated at ' + hospitalname;
            const EmailSendInt = await SendEmail('hospitals@easyaspataal.com', SubjectInt, MessageInt);

            const result = {
                code: 200,
                status: true,
                message: 'Success'
            }
            res.json(result);
        } catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'Something went wrong'
            }
            res.json(result);
            console.log(err)
        }
    },

//Qr  Payment sms
    SmsQrPayment: async (req, res) => {
        try {
            const { amount, contact, mobile, pan, aadhar } = req.body;
            var data = JSON.stringify({
              "fields": {
                "project": {
                  "key": "CLAIM"
                },
                "summary": "BNPL LEAD",
                "description": 'A new lead with below details has initiated paylater service \n pan_number:' + pan + '\n aadhar_number:' + aadhar,
                "issuetype": {
                  "name": "Bug"
                }
              }
            });
            var config = {
              method: 'post',
              url: 'https://sampat.atlassian.net/rest/api/2/issue',
              headers: {
                'Authorization': 'Basic bXBza3VtYXIwNzVAZ21haWwuY29tOkJZenlvdzNxZm1UbmxYMmdkZXdCMjUyRA==',
                'Content-Type': 'application/json',
                'Cookie': 'atlassian.xsrf.token=b3a9ba08-28f4-40e6-a877-40dbd505a6c0_4b60ed132538ce745d685a4a0983124fe1130d3e_lin'
              },
              data : data
            };
            axios(config)
            .then(function (response) {
              console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
              console.log(error);
            });
            // Send SMS
            const transaction = Math.random() * 1000000000 ;
             await SendPaymentSMS(Number(contact), Number(amount), Number(Math.round(transaction)));
             await SendPaymentSMS(Number(mobile), Number(amount), Number(Math.round(transaction)));
            const result = {
                code: 200,
                status: true,
                message: 'Success'
            }
            res.json(result);
        } catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'Something went wrong'
            }
            res.json(result);
            console.log(err)
        }
    },

    
    SendPulseQr: async (req, res) => {
        try{
            var {name,contact,qlink} = req.body;
            ////to get the Auth token

            var datat = qs.stringify({
            'grant_type': 'client_credentials',
            'client_id': '513e4cc7d7e474d739ba07d7f4356ceb',
            'client_secret': 'ac35556913ae0aa58515b064d0174571' 
            });
            var configt = {
            method: 'post',
            url: 'https://api.sendpulse.com/oauth/access_token',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : datat
            };

            axios(configt)
            .then(function (response) {
            var token=response.data.access_token;
            // console.log(token);

            ///for to check already exist or not in sendpulse///

            var configc = {
            method: 'get',
            url: 'https://api.sendpulse.com/whatsapp/contacts/getByPhone?phone='+'91'+contact+'&bot_id=618a3eea68c21d07a21e4964',
            headers: { 
                'accept': 'application/json', 
                'Authorization': 'Bearer'+ token, 
            }
            };

            axios(configc)
            .then(function (response) {
           //if user already exits then send message
        //    console.log(response.status);
            if(response.status==200){
                var datap = JSON.stringify({
                    "bot_id": "618a3eea68c21d07a21e4964",
                    "phone": '91'+contact,
                    "template": {
                        "name": "qrlink",
                        "language": {
                        "code": "en"
                        },
                        "components": [
                        {
                            "type": "body",
                            "parameters": [
                            {
                                "type": "text",
                                "text": qlink,
                            }
                            ]
                        }
                        ]
                    }
                    });
        
                    var configg = {
                    method: 'post',
                    url: 'https://api.sendpulse.com/whatsapp/contacts/sendTemplateByPhone',
                    headers: { 
                        'accept': 'application/json', 
                        'Authorization': 'Bearer'+ token, 
                        'Content-Type': 'application/json'
                    },
                    data : datap
                    };
        
                    axios(configg)
                    .then(function (response) {
                       
                    })
                    .catch(function (error) {
                    console.log(error);
                    });


            }

            
            })
            //if user not exits in sendpulse then add 
            .catch( function (error) {
                // console.log(error.response.status);
                if(error.response.status==422){
                    var dataa = JSON.stringify({
                        "phone": '91'+contact,
                        "name": name,
                        "bot_id": "618a3eea68c21d07a21e4964"
                    });
                    
                    var configa ={
                        method: 'post',
                        url: 'https://api.sendpulse.com/whatsapp/contacts',
                        headers: { 
                        'accept': 'application/json', 
                        'Authorization': 'Bearer'+ token, 
                        'Content-Type': 'application/json'
                        
                        },
                        data : dataa
                    };
                    
                    axios(configa)
                    .then( function (response) {
                        // console.log("added");
                        //send message after adding user
                        var datap = JSON.stringify({
                            "bot_id": "618a3eea68c21d07a21e4964",
                            "phone": '91'+contact,
                            "template": {
                                "name": "qrlink",
                                "language": {
                                "code": "en"
                                },
                                "components": [
                                {
                                    "type": "body",
                                    "parameters": [
                                    {
                                        "type": "text",
                                        "text": qlink
                                    }
                                    ]
                                }
                                ]
                            }
                            });
                
                            var configg = {
                            method: 'post',
                            url: 'https://api.sendpulse.com/whatsapp/contacts/sendTemplateByPhone',
                            headers: { 
                                'accept': 'application/json', 
                                'Authorization': 'Bearer'+ token, 
                                'Content-Type': 'application/json'
                            },
                            data : datap
                            };
                
                             axios(configg)
                            .then(function (response) {
                            // console.log("sent");
                            })
                            .catch(function (error) {
                            console.log(error);
                            });
                
                
                
                    //   console.log(JSON.stringify(response.data));
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
    
                }
            });



            })
            .catch(function (error) {
            console.log(error);
            });
            
        }
        catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'error'
            }
            res.json(result);
        }
           
    },
    SendPulseAgg: async (req, res) => {
      
        try {
            var {contact,agglink} = req.body;
            ////to get the Auth token

            var datat = qs.stringify({
            'grant_type': 'client_credentials',
            'client_id': '513e4cc7d7e474d739ba07d7f4356ceb',
            'client_secret': 'ac35556913ae0aa58515b064d0174571' 
            });
            var configt = {
            method: 'post',
            url: 'https://api.sendpulse.com/oauth/access_token',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data : datat
            };

            axios(configt)
            .then(function (response) {
            var token=response.data.access_token;

            // console.log(response.status);
            if(response.status==200){
                var datap = JSON.stringify({
                    "bot_id": "618a3eea68c21d07a21e4964",
                    "phone": '91'+contact,
                    "template": {
                        "name": "aggrement",
                        "language": {
                        "code": "en"
                        },
                        "components": [
                        {
                            "type": "body",
                            "parameters": [
                            {
                                "type": "text",
                                "text": agglink,
                            }
                            ]
                        }
                        ]
                    }
                    });
        
                    var configg = {
                    method: 'post',
                    url: 'https://api.sendpulse.com/whatsapp/contacts/sendTemplateByPhone',
                    headers: { 
                        'accept': 'application/json', 
                        'Authorization': 'Bearer'+ token, 
                        'Content-Type': 'application/json'
                    },
                    data : datap
                    };
        
                    axios(configg)
                    .then(function (response) {
                       
                    // console.log("sent");
                    })
                    .catch(function (error) {
                    console.log(error);
                    });
            }
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
    
Emandate: async (req, res) => {
        try{
            var {acc_type,acc_no,first_date,deb_name,email,contact,amt,agent_code,agent_id,claim,mand,cat_code} = req.body;
            var ref_id=Date.now();
            var data = JSON.stringify({
            "reference_id": ref_id,
            "debtor_account_type": acc_type,
            "debtor_account_id": acc_no,
            "occurance_sequence_type": "RCUR",
            "occurance_frequency_type": "ADHO",
            "debtor_name": deb_name,
            "email_address": email,
            "first_collection_date": first_date,
            "phone_number": contact,
            "collection_amount_type": "MAXIMUM",
            "amount": amt,
            "mandate_type_category_code": cat_code,
            "authentication_mode": mand,
            "quick_invite": true,
            "instructed_agent_code": agent_code,
            "instructed_agent_id" : agent_id,
            "scheme_reference_number":claim,
            "consumer_reference_number":claim,
            "is_until_cancel": true,
            "instructed_agent_id_type": "IFSC"
            });
            var config = {
            method: 'post',
            url: 'https://api.signdesk.in/api/live/emandateRequest',
            headers: {
                'x-parse-rest-api-key': '047c11df4e49360a0b58ec29b788325e',
                'x-parse-application-id': 'lifebox-technologies-private-limited_live_emandate',
                'Content-Type': 'application/json'
            },
            data : data
            };
            axios(config)
            .then(function (response) {
                const result = {
                    code: 200,
                    status: true,
                    message: response.data
                }
                res.json(result);
            })
            .catch(function (error) {
            console.log(error);
            });
        }
        catch (err) {
            const result = {
                code: 400,
                status: false,
                message: 'error'
            }
            res.json(result);
        }
    },

    
AgentPayment: async (req, res) => {
        try {
            var {name,contact,email,amt,agid} = req.body;
            var data = JSON.stringify({
            "amount": amt * 100,
            "currency": "INR",
            "reference_id": shortid.generate(),
            "description": "Refer By Agent",
            "customer": {
                "name": name,
                "contact": '+91'+contact,
                "email": email
            },
            "notify": {
                "sms": true,
                "email": true
            },
            "reminder_enable": true,
            "notes": {
                "from": 'agent'+agid
            },
            });
            var config = {
            method: 'post',
            url: 'https://api.razorpay.com/v1/payment_links/',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Basic cnpwX2xpdmVfbFFSTUZlNjlZMzRCb0o6OTg2NHduM2xwbTBiTzBjQXNDMGNGUlVv'
            },
            data : data
            };
            axios(config)
            .then(function (response) {
            console.log(JSON.stringify(response.data));
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
            console.log(err)
        }
    },    
    
    
EmandateStatus: async (req, res) => {
        try {
            var{eman}=req.body;
         var data = JSON.stringify({
        "emandate_id": eman
        });
        var config = {
        method: 'post',
        url: 'https://api.signdesk.in/api/emandate/getEmandateStatus',
        headers: {
            'x-parse-rest-api-key': '047c11df4e49360a0b58ec29b788325e',
            'x-parse-application-id': 'lifebox-technologies-private-limited_live_emandate',
            'Content-Type': 'application/json'
        },
        data : data
        };
        axios(config)
        .then(function (response) {
        const result = {
            code: 200,
            status: true,
            message: response.data
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
            console.log(err)
        }
    },    
    
   
};
