/* ----------------- This File Gets Data for Admin ----------------- */
/* ----------------- Created : 9-4-2021 by Prayag ----------------- */
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
/* ------------------------------------------------------------------------------------------------------------------ */

const EasyLoanSchema = require("../../../models/loan-request-schema");


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
            const EasyLoanDetails = await EasyLoanSchema.find();
            for (let index = 0; index < EasyLoanDetails.length; index++) {
                const Hospital = await HospitalSchema.findById(EasyLoanDetails[index].from);
                Result.push({
                    'id': EasyLoanDetails[index]._id,
                    'name': EasyLoanDetails[index].name,
                    'amount': EasyLoanDetails[index].loan_amount,
                    'created': EasyLoanDetails[index].created_date,
                    'mobile': EasyLoanDetails[index].mobile,
                    'source': Hospital.name,
                    'status': EasyLoanDetails[index].status,
                })
            }
            res.json(Result);
        } catch (error) {
            console.log(error);
        }
    },


};
