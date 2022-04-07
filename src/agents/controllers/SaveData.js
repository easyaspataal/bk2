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
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Schemas -------------------------------------------------- */
const AgentSchema = require("../../models/agents");
const AgentLeadsSchema = require("../../models/agent_leads");
/* ------------------------------------------------------------------------------------------------------------------ */


module.exports = {

    // Check Agent Login
    // 3-8-2021 Prayag
    Login: async (req, res) => {
        try {
            const username = req.body.username;

            const AgentDetail = await AgentSchema.findOne({ AID: username });
            if (AgentDetail === null) {
                const result = {
                    code: 404,
                    status: false,
                    message: 'No User Found'
                }
                res.json(result);
            } else {
                const isMatch = await bcrypt.compare(req.body.password, AgentDetail.password);
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
                        message: AgentDetail
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


    // Save Leads
    // 10-8-2021 Prayag
    LeadSave: async (req, res) => {
        try {
            const newLead = new AgentLeadsSchema(req.body);
            await newLead.save();
            const result = {
                code: 200,
                status: true,
                message: 'Lead saved successfully'
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