/* ----------------- This File Gets Data for Sales Dash ----------------- */
/* ----------------- Created : 3-8-2021 by Prayag ----------------- */
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Storage } = require('@google-cloud/storage');
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Schemas -------------------------------------------------- */
const AgentLeadsSchema = require("../../models/agent_leads");
/* ------------------------------------------------------------------------------------------------------------------ */


module.exports = {

    // Fetch All Agents
    // 8-8-2021 Prayag
    LeadListing: async (req, res) => {
        try {
            const agentid = req.query.AgentID;
            const LeadsData = await AgentLeadsSchema.find({AID: agentid});
            const result = {
                code: 200,
                status: true,
                message: LeadsData
            }
            res.json(result);
        } catch (error) {
            const result = {
                code: 400,
                status: false,
                message: error,
            }
            res.json(result);
            console.log(error);
        }
    },
};
