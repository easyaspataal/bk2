let mongoose = require('mongoose'),
    express = require('express'),
    router = express.Router();
const JWT = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const fs = require('fs');
const { google } = require('googleapis');


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


let user = require('../../../models/user-schema');
let patient = require('../../../models/patient-info-schema');
let patienthealth = require('../../../models/patient-health-info-schema');
let booking = require('../../../models/booking-schema');
let payment = require('../../../models/payment-schema');
let insurance = require('../../../models/insurance-schema');
let billing = require('../../../models/billing-schema');
let LoanTable = require('../../../models/loan-request-schema');
let RequestSchema = require('../../../models/requests-schema');
const PatientBillingTable = require("../../../models/billing-schema");


const AddPatientController = require("../controllers/addpatient");
const requestsSchema = require('../../../models/requests-schema');


router.route("/addpatient").post(AddPatientController.AddPatient);

router.route('/updateBookingStatus').post((req, res, next) => {
    const { patient_id } = req.body;
    const { booking_status } = req.body;
    booking.updateOne({ patient_id: patient_id }, {
        booking_status: booking_status,
    }, function (err, affected, resp) {
        console.log(resp);
    })
    res.status(200).json('Success');
});


router.route('/fetchSelectedPatientDetail').get(async (req, res) => {

    const patient_id = req.query.ID;

    const PaymentData = await payment.findOne({
        patient_id: patient_id,
    });

    const PatientData = await patient.findById(patient_id);

    const BookingData = await booking.countDocuments({
        patient_id: patient_id,
    });

    if (BookingData > 0) {
        const BookingPatientData = await booking.findOne({
            patient_id: patient_id,
        });
        var bookingdate = BookingPatientData.booking_date;
        var bookingstatus = BookingPatientData.booking_status;
    }
    else {
        var bookingdate = '';
        var bookingstatus = '';
    }

    const PatientHealthData = await patienthealth.findOne({
        patient_id: patient_id,
    });

    FinalData = {
        'name': PatientData.name,
        'age': PatientData.age,
        'dob': PatientData.dob,
        'booking_date': bookingdate,
        'booking_status': bookingstatus,
        'payment_status': PaymentData.status,
        'payment_type': PaymentData.type,
        'purpose': PatientHealthData.purpose_of_visit,
        'illness': PatientHealthData.illness,
        'status': PaymentData.status,
        'type': PaymentData.type,
        'aadhar_no': PatientData.aadhar_no,
        'mobile': PatientData.mobile,
    }
    res.status(200).json(FinalData);
});


router.route('/addinsurancedetails').post((req, res, next) => {
    insurance.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            console.log(data)
            res.json(data)
        }
    })
});


// Generate Invoice Number
// Created : 9-3-2021 Prayag
router.route('/generateinvoice').get(async (req, res) => {
    const InvoiceData = await billing.aggregate([
        { $sort: { 'invoice_no': -1 } },
        { $limit: 1 },
        {
            $project: {
                invoice_no: 1.0,
            }
        },
    ]);

    const invoiceno = InvoiceData[0].invoice_no + 1;

    res.status(200).json(invoiceno);

});


router.route('/addbillingdetails').post((req, res, next) => {
    billing.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            console.log(data)
            res.json(data)
        }
    })
});



router.route('/updatepatientbilling').post((req, res, next) => {

    const { invoiceno } = req.body;
    const { particulars } = req.body;

    billing.findOneAndUpdate({
        invoice_no: invoiceno,
    }, { $set: { particulars: particulars } }, function (err, user) {

    });
    res.status(200).json('Success');
});


// Loan Request
// Created: 24-3-2021 Prayag
router.route('/requestloan').post((req, res, next) => {
    requestsSchema.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            fs.writeFile(req.body.filename, req.body.filedata, 'base64', error => {
                if (error) {
                    throw error;
                } else {
                    const accessToken = oAuth2Client.getAccessToken();
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

                    var mailOptions = {
                        from: 'info@easyaspataal.com',
                        to: 'info@easyaspataal.com',
                        subject: '[EasyLoanRequest]',
                        text: 'You have a request for loan with following details : \n Name : ' + data.name + '\nMobile : ' + data.mobile + '\nLoan Amount  : ' + data.loanamount + '\nReason : ' + data.reason,
                        attachments: [
                            {
                                filename: req.body.filename,
                                path: './' + req.body.filename
                            }
                        ]
                    };
                    transport.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                            fs.unlinkSync(req.body.filename);
                        }
                    });
                }
            });
            res.json('Success')
        }
    })
});



module.exports = router;
