/* ----------------- This File Saves Data from Corporate ----------------- */
/* ----------------- Created : 29-7-2021 by Prayag ----------------- */
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const jwt = require("jsonwebtoken");
const fs = require('fs');
const bcrypt = require("bcryptjs");
const reader = require('xlsx');
const { Storage } = require('@google-cloud/storage');
const SendSMS = require('../../third_party/sms');
const SendEmail = require('../../third_party/email');
const passwordgen = require("../helpers/password_gen");
const request = require('request');
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Schemas -------------------------------------------------- */
const HospitalSchema = require("../../models/new_hospitals");
const AdminSchema = require("../../models/admin/sales-login");
const AgentSchema = require("../../models/agents");
const RohiniSchema = require("../../models/rohini");
/* ------------------------------------------------------------------------------------------------------------------ */


module.exports = {

    // Check Sales Admin User
    // 3-8-2021 Prayag
    Login: async (req, res) => {
        try {
            const username = req.body.username;

            const AdminDetail = await AdminSchema.findOne({
                username: username,
            });
            if (AdminDetail === null) {
                const result = {
                    code: 404,
                    status: false,
                    message: 'No User Found'
                }
                res.json(result);
            } else {
                const isMatch = await bcrypt.compare(req.body.password, AdminDetail.password);
                if (!isMatch) {
                    const result = {
                        code: 404,
                        status: false,
                        message: 'Invalid Password'
                    }
                    res.json(result);
                }
                else {
                    const result = {
                        code: 200,
                        status: true,
                        message: AdminDetail
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


    // Save Hospital
    // 29-7-2021 Prayag
    OnBoardHospital: async (req, res) => {
        try {
            const HospitalID = await HospitalSchema.aggregate([
                { $sort: { '_id': -1 } },
                { $limit: 1 },
                {
                    $project: {
                        HID: 1.0,
                    }
                },
            ]);

            var hospitalid = HospitalID[0].HID;
            var hospid = Number(hospitalid.substring(2)) + 1;

            const newHospital = new HospitalSchema(req.body);
            await newHospital.save();

            const password = passwordgen();
            const salt = await bcrypt.genSalt(10);
            var hashpass = await bcrypt.hash(password, salt);

            HospitalSchema.updateOne({ _id: newHospital._id },
                {
                    HID: 'HS' + hospid,
                    password: hashpass,
                }, function (err, affected, resp) {
                })

            // Send notification via Email
            const Subject = 'Hospital OnboardForm';
            const Message = 'Hi Team,\n\n Hospital with below details has initiated the onboarding\n\nName: ' + req.body.name + '\nEmail: ' + req.body.email + '\nContact: ' + req.body.contact + '\nHID:' + 'HS' + hospid + '\nPassword:' + password;
            const EmailSendInternal = await SendEmail('sales-ops@easyaspataal.com', Subject, Message);

            var headers = {
                'Authorization': 'e20e23bdd6ae9faf6b8eb407de1a88937af69029',
                'Content-Type': 'application/json'
            };
            var dataString = `{ "long_url": "http://qr.easyaspataal.com/${hospid}", "domain": "easptl.com", "title": "${req.body.name}" }`
            var options = {
                url: 'https://api-ssl.bitly.com/v4/bitlinks',
                method: 'POST',
                headers: headers,
                body: dataString
            };

            function callback(error, response, body) {
                var qrLink = JSON.parse(body)
                finalresult(qrLink.link);
            }
            request(options, callback);

            function finalresult(newlink) {
                const result = {
                    code: 200,
                    status: true,
                    message: {
                        hid: 'HS' + hospid,
                        link: newlink,
                        password: password
                    },
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


    updateHospital: async (req, res) => {
        try {
            HospitalSchema.updateOne({ _id: req.body.id },
                req.body, function (err, affected, resp) {
                })

            // Send notification via Email
            const Subject = 'Updated Hospital OnboardForm';
            const Message = 'Hi Team,\n\n Hospital with below details has updated the onboarding\n\nName: ' + req.body.name + '\nEmail: ' + req.body.email + '\nContact: ' + req.body.contact + '\nHID:' + 'HS' + req.body.HID;
            const EmailSend = await SendEmail('hospitals@easyaspataal.com', Subject, Message);

            res.status(200).json('Success');
        } catch (error) {
            console.log(error);
        }
    },


    // Edit Hospital
    // 9-8-2021 Prayag
    EditHospital: async (req, res) => {
        try {
            HospitalSchema.updateOne({ _id: req.body.id },
                req.body, function (err, affected, resp) {
                    console.log(resp);
                })
            res.status(200).json('Success');
        } catch (error) {
            console.log(error);
        }
    },


    // Approve Hospital
    // 9-8-2021 Prayag
    ApproveHospital: async (req, res) => {
        try {
            HospitalSchema.updateOne({ _id: req.body.id },
                req.body, function (err, affected, resp) {
                    console.log(resp);
                })
            const result = {
                code: 200,
                status: true,
                message: 'Hospital Onboarded Successfully'
            }
            res.json(result);
        } catch (error) {
            console.log(error);
        }
    },

    // Save Agent
    // 7-8-2021 Prayag
    SaveAgent: async (req, res) => {
        try {

            const AgentID = await AgentSchema.aggregate([
                { $sort: { '_id': -1 } },
                { $limit: 1 },
                {
                    $project: {
                        AID: 1.0,
                    }
                },
            ]);
            var agentid = AgentID[0].AID;
            var aid = Number(agentid.substring(2)) + 1;

            const newAgent = new AgentSchema(req.body);
            await newAgent.save();

            // Password Generation
            const password = passwordgen();
            const salt = await bcrypt.genSalt(10);
            var hashpass = await bcrypt.hash(password, salt);

            AgentSchema.updateOne({ _id: newAgent._id },
                {
                    AID: 'AG' + aid,
                    password: hashpass,
                }, async function (err, affected, resp) {
                    // Send notification via Email
                    const Subject = 'Welcome to EasyAspataal';
                    const Message = 'Dear ' + req.body.name + ',\n\n\n Welcome aboard with Easyaspataal. Below are your login credentials for login at https://agent-portal-gwli64osaq-el.a.run.app \n\n UserID: AG' + aid + '\n Password: ' + password + '       \n\n\n\n\n\n Warm Regards,\n EasyAspataal Team';
                    const EmailSend = await SendEmail(req.body.email, Subject, Message);
                    const EmailSendInternal = await SendEmail('shweta@easyaspataal.com', Subject, Message);
                    const result = {
                        code: 200,
                        status: true,
                        message: 'AG' + aid
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

    // Edit Agent
    // 9-8-2021 Prayag
    EditAgent: async (req, res) => {
        try {
            AgentSchema.updateOne({ _id: req.body.id },
                req.body, function (err, affected, resp) {
                    console.log(resp);
                })
            res.status(200).json('Success');
        } catch (error) {
            console.log(error);
        }
    },


    // Save Uploaded Files
    // 12-8-2021 Prayag
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
                    bucket.upload(req.body.filename, { destination: "agents/" + req.body.agentname + "/" + req.body.filename }, function (err, file) {
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


    // Read Excel
    // 31-8-2021 Prayag
    ReadExcel: async (req, res) => {
        try {
            await fs.writeFile(req.body.filename, req.body.data, 'base64', async error => {
                if (error) {
                    throw error;
                } else {
                    // Read Excel
                    const excelfile = reader.readFile('./' + req.body.filename);
                    const temp = reader.utils.sheet_to_json(excelfile.Sheets[excelfile.SheetNames[0]], { raw: false });

                    for (let index = 0; index < temp.length; index++) {
                        const newRohini = new RohiniSchema({
                            name: temp[index]['Name'],
                            address: temp[index]['Address'],
                            rohini_id: temp[index]['Hospital Unique ID'],
                            email: temp[index]['Email id'],
                            contact: temp[index]['Contact Detail'],
                            state: temp[index]['state'],
                            district: temp[index]['District'],
                        });
                        await newRohini.save();
                    }
                    fs.unlinkSync(req.body.filename);

                    const result = {
                        code: 200,
                        status: true,
                        message: 'Success'
                    }
                    res.json(result);
                }
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

    //Created: 22-11-2021
    SendEditRequest: async (req, res) => {
        try {
            const HospitalData = await HospitalSchema.findOne({ _id: req.body.id });
            const Subject = 'Edit Onboard Form';
            const Message = 'Dear ' + HospitalData.name + '\n\nKindly complete your Onboarding form as  your ' + req.body.issues + ' details are missing. Please find the below link to fillup mandatory details \n https://hospon-prod-gwli64osaq-uc.a.run.app/' + req.body.id + '\n\n\nRegards\nTeam Easyaspataal';
            const EmailSend = await SendEmail(HospitalData.email, Subject, Message);
            const result = {
                code: 200,
                status: true,
                message: 'Success'
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
