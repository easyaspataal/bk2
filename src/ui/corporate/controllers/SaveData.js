/* ----------------- This File Saves Data from Corporate ----------------- */
/* ----------------- Created : 1-6-2021 by Prayag ----------------- */
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const jwt = require("jsonwebtoken");
const fs = require('fs');
const bcrypt = require("bcryptjs");
const reader = require('xlsx');
const { Storage } = require('@google-cloud/storage');
const SendSMS = require('../../../third_party/sms');
const SendEmail = require('../../../third_party/email');
const passwordgen = require("../helpers/password_gen");
const CheckLeadSquareUser = require('../../../third_party/LeadSquare/checkLead');
const SaveLeadSquareUser = require('../../../third_party/LeadSquare/saveLead');
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Schemas -------------------------------------------------- */
const CorporateSchema = require("../../../models/corporate");
const UsersSchema = require("../../../models/users");
const EmployeesSchema = require("../../../models/employees");
const RequestVaccinationSchema = require("../../../models/requests-vaccination");
const RequestKYCSchema = require("../../../models/requests-kyc");
const RequestSurgerySchema = require("../../../models/requests-surgery");
const RequestEstimateSchema = require("../../../models/requests-estimation");
const RequestEMISchema = require("../../../models/requests-emi");
const CreditsSchema = require("../../../models/credits");
/* ------------------------------------------------------------------------------------------------------------------ */


module.exports = {
    // Send OTP SMS
    // 1-6-2021 Prayag
    SendOTP: async (req, res) => {
        try {
            const { mobile, otp } = req.body;

            // Check if employee exists
            const CheckUser = await UsersSchema.countDocuments({ cmobile: mobile });

            if (CheckUser > 0) {
                // Send SMS with OTP 
                const smsSend = SendSMS(otp, mobile);
                const User = await UsersSchema.findOne({ cmobile: mobile });
                const result = {
                    code: 200,
                    status: true,
                    message: User.EID,
                }
                res.json(result);
            }
            else {

                // Check Retail user
                const CheckRetailUser = await UsersSchema.countDocuments({ mobile: mobile });

                if (CheckRetailUser > 0) {
                    // Send SMS with OTP 
                    const smsSend = SendSMS(otp, mobile);
                    const User = await UsersSchema.findOne({ mobile: mobile });
                    const result = {
                        code: 200,
                        status: true,
                        message: User.EID,
                    }
                    res.json(result);
                }
                else {

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
                        from: 'app',
                        relations: relationArr,
                    });
                    const UserDetails = await saveuser.save();

                    // KYC Save
                    const newKYC = new RequestKYCSchema({
                        EID: 'EA' + eid,
                        from: 'app',
                        status: 'pending',
                    });
                    await newKYC.save();

                    // Send SMS with OTP 
                    const smsSend = SendSMS(otp, mobile);

                    const result = {
                        code: 200,
                        status: true,
                        message: 'EA' + eid,
                    }
                    res.json(result);
                }
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


    // Save Corporate
    // 1-6-2021 Prayag
    OnboardCorporate: async (req, res) => {
        try {
            const { name, phone, email, company } = req.body.data;

            // Check Corporate
            const CheckCorporate = await CorporateSchema.countDocuments({ email: email.toLowerCase() });

            if (CheckCorporate > 0) {
                const result = {
                    code: 200,
                    status: true,
                    message: 'exists'
                }
                res.json(result);
            }
            else {
                // Generate Password
                const password = passwordgen();
                const salt = await bcrypt.genSalt(10);
                var hashpass = await bcrypt.hash(password, salt);

                // Save Corporate
                const savecorporate = new CorporateSchema({
                    name: name,
                    mobile: phone,
                    email: email.toLowerCase(),
                    company_name: company,
                    password: hashpass,
                });
                const savedCorporateDetails = await savecorporate.save();

                // Send Email to Corporate
                const Subject = 'Welcome aboard with EasyAspataal';
                const Message = 'Dear Corporate,\n\n\n Please find the below password for logging in https://www.easyaspataal.com/corporate \n\n\n User ID : ' + email + '\nPassword: ' + password + '\n\n\n\n\n\n\n Warm Regards,\n EasyAspataal Team';
                // const EmailSend = await SendEmail(email, Subject, Message);
                const EmailSendInternal = await SendEmail('prayag@easyaspataal.com', Subject, Message);

                const result = {
                    code: 200,
                    status: true,
                    message: 'Saved Successfully'
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
        }
    },

    // Save User
    // 10-6-2021 Prayag
    SaveUser: async (req, res) => {
        try {

            const { firstname, lastname, fathername, mothername, dob, gender, marital_status, email, mobile, pan, aadharno, address1, address2, pincode, city, state, eid, age } = req.body;

            await UsersSchema.updateOne({ EID: eid }, {
                name: firstname + ' ' + lastname,
                father_name: fathername,
                mother_name: mothername,
                dob: dob,
                gender: gender,
                age: age,
                marital_status: marital_status,
                email: email,
                pincode: pincode,
                address_line1: address1,
                address_line2: address2,
                city: city,
                state: state,
                from: 'app',
            }, function (err, affected, resp) {

                RequestKYCSchema.updateOne({ EID: eid }, {
                    pan: pan,
                    aadhar_no: aadharno,
                    status: 'in_process',
                    from: 'app',
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


    // Edit Corporate
    // 16-6-2021 Prayag
    EditCorporate: async (req, res) => {
        try {
            const { id, name, phone, email, company } = req.body.CorporateObject;

            await CorporateSchema.updateOne({ _id: id }, {
                name: name,
                mobile: phone,
                email: email,
                company_name: company,
            }, function (err, affected, resp) {
                const result = {
                    code: 200,
                    status: true,
                    message: 'Details edited successfully'
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


    // Edit Corporate Password
    // 16-6-2021 Prayag
    ResetCorporatePassword: async (req, res) => {
        try {

            const { id, password } = req.body;

            const CorporateCheck = await CorporateSchema.findById(id);

            const email = CorporateCheck.email;

            const isMatch = await bcrypt.compare(password, CorporateCheck.password);
            if (isMatch) {
                // Generate Password
                const password = passwordgen();
                const salt = await bcrypt.genSalt(10);
                var hashpass = await bcrypt.hash(password, salt);

                //Send new Password via Email
                const Subject = 'Reset Password - EasyAspataal';
                const Message = 'Dear Corporate,\n\n\n Please find the below generated new password for logging in https://www.easyaspataal.com/corporate \n\n\n Password: ' + password + '\n\n\n\n\n\n\n Warm Regards,\n EasyAspataal Team';
                const EmailSend = await SendEmail(email, Subject, Message);

                await CorporateSchema.updateOne({ _id: id }, {
                    password: hashpass,
                }, function (err, affected, resp) {
                    const result = {
                        code: 200,
                        status: true,
                        message: 'Password generated successfully'
                    }
                    res.json(result);
                })

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


    // Save KYC Uploaded Files
    // 28-6-2021 Prayag
    Uploads: async (req, res) => {
        try {

            const { aadharno, panno, aadharimg, panimg, bankimg, taximg, eid, others } = req.body;

            ////Bank Statement
            //if (req.body.bankfilename !== '' || req.body.bankfilename !== null) {
            //    fs.writeFile(req.body.bankfilename, req.body.bankimage_data, 'base64', error => {
            //        if (error) {
            //            throw error;
            //        } else {
            //            const bucket = PrivateBucket.bucket('main_pvt');
            //            bucket.upload(req.body.bankfilename, { destination: "users/" + req.body.eid + "/kyc/" + req.body.bankfilename }, function (err, file) {
            //                if (err) {
            //                    throw new Error(err);
            //                }
            //                fs.unlinkSync(req.body.bankfilename);
            //            });
            //        }
            //    });
            //}

            // Check KYC Status
            const CheckKYCStatus = await RequestKYCSchema.findOne({ EID: eid });
            if (CheckKYCStatus.pan !== '' && CheckKYCStatus.aadhar_no !== '' && CheckKYCStatus.pan_img !== '' && CheckKYCStatus.aadhar_img !== '' && CheckKYCStatus.bank_img !== '') {
                var status = 'pending';
            }
            else {
                var status = 'completed';
            }

            RequestKYCSchema.updateOne({ EID: eid }, {
                pan: panno,
                aadhar_no: aadharno,
                aadhar_img: aadharimg,
                pan_img: panimg,
                bank_img: bankimg,
                tax_img: taximg,
                status: status,
                others: others,
                from: 'app',
            }, function (err, affected, resp) {
                const result = {
                    code: 200,
                    status: true,
                    message: 'Details saved successfully'
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


    // Save Disbursement
    // 28-6-2021 Prayag
    SaveDisbursement: async (req, res) => {
        try {
            // const { surgery, cost, hospital_name, hospital_pincode, hospital_contact, eid, type } = req.body;

            // const UserData = await UsersSchema.findOne({ EID: eid });

            // const Checking = await CheckLeadSquareUser('878677');

            // if (Array.isArray(Checking) && Checking.length) {
            //     console.log('Not Empty');
            // }
            // else {
            //     console.log('Empty');
            // }

            const RID = Math.floor(Math.random() * 1000000000);

            // Save Surgery
            const savesurgery = new RequestSurgerySchema({
                EID: eid,
                surgery: surgery,
                estimated_cost: cost,
                hospital_name: hospital_name,
                hospital_contact: hospital_contact,
                hospital_pincode: hospital_pincode,
                type: type,
                ID: RID,
                from: 'app',
                status: 'pending'
            });
            const savedSurgeryDetails = await savesurgery.save();

            // Check for Credits 
            const CheckCredits = await CreditsSchema.countDocuments({ EID: eid });
            // If exists
            if (CheckCredits > 0) {

                //Update Credits
                const creditsArr = {
                    type: 'disbursement',
                    ID: RID,
                    amount: 7878787,
                    start: '08/2021',
                    end: '11/2025',
                    emi: 9000,
                    status: 'active',
                };

                // Update User
                const savedCreditsDetails = await CreditsSchema.findOneAndUpdate(
                    { EID: eid },
                    { $push: { credits: creditsArr } },
                    { upsert: true, new: true }
                );
                const result = {
                    code: 200,
                    status: true,
                    message: savedCreditsDetails
                }
                res.json(result);
            }
            // If new
            else {
                // Save Credits
                const creditsArr = {
                    type: 'disbursement',
                    ID: RID,
                    amount: 7878787,
                    start: '08/2021',
                    end: '11/2025',
                    emi: 9000,
                    status: 'active',
                };

                const savecredits = new CreditsSchema({
                    EID: eid,
                    status: 'active',
                    credits: creditsArr,
                });
                const savedCreditsDetails = await savecredits.save();
                const result = {
                    code: 200,
                    status: true,
                    message: RID
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
        }
    },


    // Save Surgery
    // 28-6-2021 Prayag
    SaveSurgery: async (req, res) => {
        try {
            const { surgery, budget, eid, finance, insurance, city } = req.body;

            // const UserData = await UsersSchema.findOne({ EID: eid });
            // if (UserData.cmobile == null || UserData.cmobile == '') {
            //     var phone = UserData.cmobile;
            // }
            // else {
            //     var phone = UserData.mobile;
            // }

            // const Checking = await CheckLeadSquareUser(phone);

            // if (Array.isArray(Checking) && Checking.length) {
            //     console.log('Not Empty');
            // }
            // else {
            //     const LeadData = [
            //         {
            //             "Attribute": "EmailAddress",
            //             "Value": "test@easyaspataal.com"
            //         },
            //         {
            //             "Attribute": "FirstName",
            //             "Value": "TEST"
            //         },
            //         {
            //             "Attribute": "LastName",
            //             "Value": ""
            //         },
            //         {
            //             "Attribute": "Phone",
            //             "Value": "8888888888"
            //         }
            //     ]

            //     const SaveLeadUserData = await SaveLeadSquareUser(LeadData);

            // }


            // Save Estimate
            const saveestimate = new RequestEstimateSchema({
                EID: eid,
                treatment: surgery,
                budget: budget,
                finance: finance,
                insurance: insurance,
                city: city,
                status: 'pending',
                from: 'app'
            });
            const savedEstimateDetails = await saveestimate.save();

            const result = {
                code: 200,
                status: true,
                message: 'Details Saved Successfully'
            }
            res.json(result);
        } catch (error) {
            const result = {
                code: 400,
                status: false,
                message: error
            }
            res.json(result);
        }
    },


    // Save EMI
    // 30-6-2021 Prayag
    SaveEMI: async (req, res) => {
        try {
            const { total_amount, tenure, emi_amount, eid } = req.body;

            // Save EMI
            const saveemi = new RequestEMISchema({
                EID: eid,
                total_amount: total_amount,
                tenure_in_months: tenure,
                expiry_date: '08/2025',
                emi_amount: emi_amount,
                status: 'pending',
                from: 'app'
            });
            const savedEMIDetails = await saveemi.save();

            const result = {
                code: 200,
                status: true,
                message: 'Details Saved Successfully'
            }
            res.json(result);
        } catch (error) {
            const result = {
                code: 400,
                status: false,
                message: error
            }
            res.json(result);
        }
    },


    // Forgot Corporate Password
    // 5-7-2021 Prayag
    ForgotCorporatePassword: async (req, res) => {
        try {

            const { email } = req.body.data;

            const CorporateCheck = await CorporateSchema.countDocuments({ email: email });

            if (CorporateCheck > 0) {
                // Generate Password
                const password = passwordgen();
                const salt = await bcrypt.genSalt(10);
                var hashpass = await bcrypt.hash(password, salt);

                //Send new Password via Email
                const Subject = 'Reset Password - EasyAspataal';
                const Message = 'Dear Corporate,\n\n\n Please find the below generated new password for logging in https://www.easyaspataal.com/corporate \n\n\n User ID : ' + email + '\nPassword: ' + password + '\n\n\n\n\n\n\n Warm Regards,\n EasyAspataal Team';
                const EmailSend = await SendEmail(email, Subject, Message);

                await CorporateSchema.updateOne({ email: email }, {
                    password: hashpass,
                }, function (err, affected, resp) {
                    const result = {
                        code: 200,
                        status: true,
                        message: 'Password generated successfully'
                    }
                    res.json(result);
                })
            }
            else {
                const result = {
                    code: 400,
                    status: false,
                    message: 'Corporate does not exist'
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

    // Save Dependent
    // 15-7-2021 Prayag
    SaveDependent: async (req, res) => {
        try {
            const { relation, name, eid, age, gender, mobile, email } = req.body;

            //New Employee ID
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
            var neweid = Number(userid.substring(2)) + 1;

            // Save Dependent
            const saveuser = new UsersSchema({
                name: name,
                EID: 'EA' + neweid,
                gender: gender,
                email: email,
                mobile: mobile,
                age: age,
                relation: relation,
                from: 'app',
            });
            const savedUserDetails = await saveuser.save();

            //Update Relation in User
            const relationArr = {
                EID: 'EA' + neweid,
                relation: relation,
            };

            // Update User
            const updatedUser = await UsersSchema.findOneAndUpdate(
                { EID: eid },
                { $push: { relations: relationArr } },
                { upsert: true, new: true }
            );
            const result = {
                code: 200,
                status: true,
                message: 'Dependent added successfully'
            }
            res.json(result);
        } catch (error) {
            const result = {
                code: 400,
                status: false,
                message: error
            }
            res.json(result);
        }
    },


    // Corporate Save Onboarding Excel
    // 16-7-2021 Prayag
    UploadExcel: async (req, res) => {
        try {
            const projectId = 'eamigrate';
            const keyFilename = 'src/configuration/private_bucket_keys.json';
            const PrivateBucket = new Storage({ projectId, keyFilename });

            const CorporateData = await CorporateSchema.findById(req.body.company);

            fs.writeFile(req.body.filename, req.body.data, 'base64', error => {
                if (error) {
                    throw error;
                } else {
                    // Save Uploaded Excel to Bucket
                    const bucket = PrivateBucket.bucket('main_pvt');
                    bucket.upload(req.body.filename, { destination: "corporates/" + CorporateData.company_name + '/' + req.body.filename }, async function (err, file) {
                        if (err) {
                            throw new Error(err);
                        }

                        // Read Excel
                        const excelfile = reader.readFile('./' + req.body.filename);

                        const temp = reader.utils.sheet_to_json(excelfile.Sheets[excelfile.SheetNames[0]], { raw: false });

                        var countusers = 0;

                        if (req.body.type == 'cashless') {

                            // Check for EasyAspataal ID
                            await UsersSchema.countDocuments(async function (err, count) {
                                if (!err && count === 0) {
                                    var eid = 100010;
                                }
                                else {
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
                                }

                                for (let index = 0; index < temp.length; index++) {

                                    const CheckEmployee = await UsersSchema.countDocuments({ cmobile: temp[index]['Mobile Number'] });

                                    if (CheckEmployee === 0) {
                                        //Check Valid Mobile Numbe
                                        if (temp[index]['Mobile Number'].toString().length === 10) {
                                            // Employee Save
                                            const newEmployee = new EmployeesSchema({
                                                name: temp[index]['Full Name'],
                                                gender: temp[index].Gender,
                                                cmobile: temp[index]['Mobile Number'],
                                                corporate_name: temp[index]['Corporate Name'],
                                                corporate_id: req.body.company,
                                                EID: 'EA' + eid,
                                                employee_id: temp[index]['Employee ID'],
                                                joining_date: temp[index]['Date of Joining'],
                                                employment_status: temp[index]['Employment Status( If on Notice, Left, Active)'],
                                                sum_insured: temp[index]['Sum Insured'],
                                                insurance_company: temp[index]['Insurance Company'],
                                                cemail: temp[index]['Official EmailID'],
                                                branch: temp[index]['Branch Location'],
                                                designation: temp[index]['Designation'],
                                                last_monthly_salary: temp[index]['Last drawn Monthly Gross Salary'],
                                                dependent1: temp[index]['Dependent 1'],
                                                dependent2: temp[index]['Dependent 2'],
                                                dependent3: temp[index]['Dependent 3'],
                                            });
                                            await newEmployee.save();

                                            //Relation Array
                                            const RelationArr = {
                                                EID: 'EA' + eid,
                                                relation: 'self',
                                            }

                                            // User Save
                                            const newEmployeeUsers = new UsersSchema({
                                                name: temp[index]['Full Name'],
                                                gender: temp[index].Gender,
                                                cmobile: temp[index]['Mobile Number'],
                                                dob: temp[index]['DOB'],
                                                cemail: temp[index]['Official EmailID'],
                                                marital_status: temp[index]['Marital Status'],
                                                corporate_id: req.body.company,
                                                relation: 'self',
                                                EID: 'EA' + eid,
                                                from: 'corporate',
                                                otp_verified: false,
                                                kyc_verified: false,
                                                relations: RelationArr,
                                            });
                                            await newEmployeeUsers.save();

                                            // KYC Save
                                            const newKYC = new RequestKYCSchema({
                                                pan: temp[index]['Pan Number'],
                                                EID: 'EA' + eid,
                                                from: 'corporate',
                                                status: 'pending',
                                            });
                                            await newKYC.save();

                                            // Credit Save
                                            const newCredits = new CreditsSchema({
                                                EID: 'EA' + eid,
                                                cover_amount: temp[index]['Sum Insured'],
                                                status: 'inactive',
                                                from: 'corporate',
                                            });
                                            await newCredits.save();

                                            // // //Send notification via Email
                                            // const Subject = 'Welcome to EasyAspataal';
                                            // const Message = 'Dear ' + temp[index]['Full Name'] + ',\n\n\n Your Cashless facility has been successfully initiated. \n\n\n\n\n\n\n Warm Regards,\n EasyAspataal Team';
                                            // const EmailSend = await SendEmail(temp[index]['Official EmailID'], Subject, Message);

                                            eid++;
                                            countusers++;
                                        }
                                    }
                                }

                                // Corporate Email
                                // const CorporateEmail = await CorporateSchema.findById(req.body.company);

                                // // //Send notification via Email
                                // const Subject = 'Employees Onboard - EasyAspataal';
                                // const Message = 'Dear ' + CorporateEmail.name + ',\n\n\n Enrollment request for ' + countusers + ' employees for Cashless Facility has been successfully received.\n We shall keep you and your employees updated with the next steps. \n\n\n\n\n\n\n Warm Regards,\n EasyAspataal Team';
                                // const EmailSend = await SendEmail(CorporateEmail.email, Subject, Message);
                                // const EmailSendInternal = await SendEmail('shweta@easyaspataal.com', Subject, Message);

                                fs.unlinkSync(req.body.filename);

                                const result = {
                                    code: 200,
                                    status: true,
                                    message: countusers
                                }
                                res.json(result);
                            })
                        }

                        else {
                            // Check for EasyAspataal ID
                            await UsersSchema.countDocuments(async function (err, count) {
                                if (!err && count === 0) {
                                    var eid = 100010;
                                }
                                else {
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
                                }

                                for (let index = 0; index < temp.length; index++) {

                                    const CheckEmployee = await UsersSchema.countDocuments({ cmobile: temp[index]['Mobile Number'] });

                                    if (CheckEmployee === 0) {
                                        if (temp[index]['Mobile Number'].toString().length === 10) {
                                            // User Save

                                            //Relation Array
                                            const RelationArr = {
                                                EID: 'EA' + eid,
                                                relation: 'self',
                                            }

                                            const newEmployeeUsers = new UsersSchema({
                                                name: temp[index].Name,
                                                age: temp[index].Age,
                                                gender: temp[index].Gender,
                                                cmobile: temp[index]['Mobile Number'],
                                                dob: temp[index]['Date of Birth'],
                                                address_area: temp[index]['Address Area'],
                                                state: temp[index]['State '],
                                                corporate_id: req.body.company,
                                                EID: 'EA' + eid,
                                                relation: 'self',
                                                from: 'corporate_vaccine',
                                                otp_verified: false,
                                                kyc_verified: false,
                                                relations: RelationArr,
                                            });
                                            await newEmployeeUsers.save();

                                            // KYC Save
                                            const newKYC = new RequestKYCSchema({
                                                aadhar_no: temp[index]['Adhar No'],
                                                EID: 'EA' + eid,
                                                from: 'ui',
                                                status: 'pending',
                                            });
                                            await newKYC.save();

                                            eid++;
                                            countusers++;
                                        }
                                    }
                                }

                                // Save Vaccination Requests
                                const requests = new RequestVaccinationSchema({
                                    enrolled: countusers,
                                    venue_address1: '',
                                    venue_address2: '',
                                    corporate_id: req.body.company,
                                    from: 'ui',
                                    status: 'pending',
                                });
                                await requests.save();

                                // Corporate Email
                                const CorporateEmail = await CorporateSchema.findById(req.body.company);

                                //Send notification via Email
                                const Subject = 'Employees Vaccination Drive - EasyAspataal';
                                const Message = 'Dear ' + CorporateEmail.name + ',\n\n\n Vaccination request for ' + countusers + ' employees has been successfully received. We shall keep you and your employees updated with the next steps. \n\n\n\n\n\n\n Warm Regards,\n EasyAspataal Team';
                                const EmailSend = await SendEmail(CorporateEmail.email, Subject, Message);
                                const EmailSendInternal = await SendEmail('shweta@easyaspataal.com', Subject, Message);

                                fs.unlinkSync(req.body.filename);
                                const result = {
                                    code: 200,
                                    status: true,
                                    message: countusers
                                }
                                res.json(result);
                            })
                        }
                    });
                }
            });
        } catch (error) {
            console.log(error);
        }
    },


    // Edit Dependent
    // 19-7-2021 Prayag
    EditDependent: async (req, res) => {
        try {
            const { relation, name, eid, age, gender, mobile, email } = req.body;

            await UsersSchema.updateOne({ EID: eid }, {
                name: name,
                age: age,
                email: email,
                gender: gender,
                mobile: mobile,
                relation: relation,
            }, function (err, affected, resp) {
                const result = {
                    code: 200,
                    status: true,
                    message: 'Details edited successfully'
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


    // Delete Dependent
    // 19-7-2021 Prayag
    DeleteDependent: async (req, res) => {
        try {
            const { eid } = req.body;
            UsersSchema.deleteOne({ EID: eid }, function (err, DeleteCall) {
                if (!err)
                    console.log(DeleteCall);
            });
            const result = {
                code: 200,
                status: true,
                message: 'Details Saved Successfully'
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


    // Activate Credit Card
    // 26-7-2021 Prayag
    ActivateCredit: async (req, res) => {
        try {
            const { eid } = req.body;

            await CreditsSchema.updateOne({ EID: eid }, {
                status: 'active',
                from: 'app'
            }, function (err, affected, resp) {
                const result = {
                    code: 200,
                    status: true,
                    message: 'Credit activated successfully'
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


    // Save Retail Disbursement
    // 31-7-2021 Prayag
    SaveRetailDisbursement: async (req, res) => {
        try {
            const { surgery, cost, hospital_name, hospital_pincode, hospital_contact, aadharno, panno, aadharimg, panimg, bankimg, eid, type } = req.body;

            // Save Surgery
            const savesurgery = new RequestSurgerySchema({
                EID: eid,
                surgery: surgery,
                estimated_cost: cost,
                hospital_name: hospital_name,
                hospital_contact: hospital_contact,
                hospital_pincode: hospital_pincode,
                type: type,
                from: 'app',
                status: 'pending',
            });
            const savedSurgeryDetails = await savesurgery.save();

            RequestKYCSchema.updateOne({ EID: eid }, {
                pan: panno,
                aadhar_no: aadharno,
                aadhar_img: aadharimg,
                pan_img: panimg,
                bank_img: bankimg,
                status: 'complete',
                from: 'app',
            }, function (err, affected, resp) {
                const result = {
                    code: 200,
                    status: true,
                    message: 'Details saved successfully'
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
        }
    },


    // Send Query
    // 7-8-2021 Prayag
    SendQuery: async (req, res) => {
        try {
            const { eid, query } = req.body;

            //Send Query via Email
            const Subject = 'Query - EasyAspataal';
            const Message = 'User with EID ' + eid + 'has the following query\n' + query;
            const EmailSend = await SendEmail('support@easyaspataal.com', Subject, Message);

            const result = {
                code: 200,
                status: true,
                message: 'Query sent successfully.Our executive will get back to you soon'
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


};
