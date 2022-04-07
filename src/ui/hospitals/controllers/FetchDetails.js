/* ----------------- This File Gets Data for UI Hospitals ----------------- */
/* ----------------- Created : 30-8-2021 by Prayag ----------------- */
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var axios = require ('axios')
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Schemas -------------------------------------------------- */
const HospitalSchema = require("../../../models/new_hospitals");
const InsuranceSchema = require("../../../models/insurance");
const UsersSchema = require('../../../models/users');
/* ------------------------------------------------------------------------------------------------------------------ */


module.exports = {
    // Fetch Easy Loan Data
    // 12-4-2021 Prayag
    GetHospitals: async (req, res) => {
        try {
            const HospitalsData = await HospitalSchema.find();
            const result = {
                code: 200,
                status: true,
                message: HospitalsData
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

    // Fetch Selected Hospital Data
    // 2-9-2021 Prayag
    GetSelectedHospitals: async (req, res) => {
        try {
            const HospitalsData = await HospitalSchema.findOne({ HID: 'HS' + req.query.HID });
            const result = {
                code: 200,
                status: true,
                message: HospitalsData
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

    // Fetch Insurance List
    // 10-9-2021 Prayag
    GetInsurance: async (req, res) => {
        try {
            const InsuranceData = await InsuranceSchema.find({}, 'insurer', function (err, data) {
                const result = {
                    code: 200,
                    status: true,
                    message: data
                }
                res.json(result);
            });
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

    // Fetch User
    // 26-10-2021 Prayag
    GetUser: async (req, res) => {
        try {

            const { mobile } = req.query;

            var UserData = [];

            const CheckUser = await UsersSchema.countDocuments({ mobile: mobile });

            if (CheckUser == 0) {
                const CheckCorpUser = await UsersSchema.countDocuments({ cmobile: mobile });
                if (CheckCorpUser > 0) {
                    var UserData = await UsersSchema.findOne({ cmobile: mobile });
                }
            }
            else {
                var UserData = await UsersSchema.findOne({ mobile: mobile });
            }
            const result = {
                code: 200,
                status: true,
                message: UserData
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
    
    
    
////// Fetch Hospital data in Jira By Reporter
//25-02-2022 pratik
    HospitalReporter: async (req, res) => {
        try {
            
            const reporter = req.query.reporterID;
            const HospitalsData = await HospitalSchema.findOne({ email: reporter }, { name: 1, email: 1, contact: 1,bank_details: 1,address:1,HID:1,pincode:1,city:1,ownership:1,accreditation:1,registration_no:1,state:1,website:1,insurance_accepted:1, });

            const result = {
                code: 200,
                status: true,
                message: HospitalsData
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
    
    
    
DasboardJiraList: async (req, res) => {
        try {
            var reporterId = req.query.reporterId
var config = {
  method: 'get',
  url: 'http://easylos.atlassian.net/rest/api/2/search?jql=reporter='+`'${reporterId}'`,
  headers: {
    'Authorization': 'Basic Y2hpcmFnQGVhc3lhc3BhdGFhbC5jb206RngzaHZOeXpzWmRQZjRNcmtzN0s5RUUw'
  }
};
axios(config)
.then(function (response) {
    var patientarr = [];
    var amountarr = [];
    var datearr = [];
    var keyarr = [];
    var statusarr = [];
    var summaryarr = [];
    var createdarr = [];
    response.data.issues.map((issue, index) => {
 const patientresult = issue.fields.customfield_10040
patientarr.push(patientresult)
const amountresult = issue.fields.customfield_10182
amountarr.push(amountresult)
const dateresult = issue.fields.customfield_10090
datearr.push(dateresult)
 const keyresult = issue.key;
 keyarr.push(keyresult)
 const statusresult = issue.fields.status.name;
 statusarr.push(statusresult);
 const summaryresult = issue.fields.summary;
 summaryarr.push(summaryresult);
 const createdresult = new Date(Date.parse(issue.fields.created)).toLocaleString().replace(","," ");
 createdarr.push(createdresult)
    })
var items = keyarr.map((keyarr, index) => {
    return {
      key: keyarr,
      status: statusarr[index],
      summary: summaryarr[index],
      created: createdarr[index],
      patient: patientarr[index],
      amount : amountarr[index],
      date: datearr[index],
      type: 'cashless'
    }
  });
    const result = {
    code: 200,
    status: true,
    message:items
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
    
    
    
ViewReporterList: async (req, res) => {
    try {
        var claimNo = req.query.claimNo
        var config = {
            method: 'get',
            url: 'https://easylos.atlassian.net/rest/api/3/issue/'+`${claimNo}`,
            headers: {
              'Authorization': 'Basic Y2hpcmFnQGVhc3lhc3BhdGFhbC5jb206RngzaHZOeXpzWmRQZjRNcmtzN0s5RUUw',
              'Cookie': 'atlassian.xsrf.token=2320118d-6d73-4369-addd-eae328a4f16c_58b871a951e71de458a51cdbf179fadbb4451616_lin'
            }
          };
          axios(config)
          .then(function (response) {
              var statearr = [];
              var policyholdernamearr = [];
              var patientnamearr = [];
              var pinarr = [];
              var aadhararr = [];
              var approvalamountarr = [];
              var cityarr = [];
              var panarr = [];
              var contactarr = [];
              var dobarr = [];
              var agreementstatusarr = [];
              var paymentstatusarr = [];
              var commentarr = [];
              var keyarr = [];
             keyarr.push(response.data.key)
            //Policy holder name
            policyholdernamearr.push(response.data.fields.customfield_10041)
            //patient name
            patientnamearr.push(response.data.fields.customfield_10040)
            //state
            statearr.push(response.data.fields.customfield_10395[0].value)
            //final approval amount
            approvalamountarr.push(response.data.fields.customfield_10180)
            //city
            cityarr.push(response.data.fields.customfield_10189)
            //pan
            panarr.push(response.data.fields.customfield_10057)
            //contact
            contactarr.push(response.data.fields.customfield_10107)
            //pincode
            pinarr.push(response.data.fields.customfield_10231)
            //aadhar
            aadhararr.push(response.data.fields.customfield_10104)
            //dob
            dobarr.push(response.data.fields.customfield_10103)
            //agreement status
            if(response.data.fields.customfield_10339 == null){
                agreementstatusarr.push('Not Updated')
              }
              else{
                agreementstatusarr.push(response.data.fields.customfield_10339.value)
              }
              //599 status
              if(response.data.fields.customfield_10345 == null){
                paymentstatusarr.push('Not Updated')
              }
              else{
                paymentstatusarr.push(response.data.fields.customfield_10345.value)
              }
              response.data.fields.comment.comments.map((val, index) => {
                val.body.content.map((value, indx) => {
                  value.content.map((values, key) => {
                    commentarr.push(values.text)
                  })
                })
              })
           var items = statearr.map((statearr, index) => {
            return {
              state: statearr,
              city: cityarr[index],
              pan: panarr[index],
              contact: contactarr[index],
              policyholdername: policyholdernamearr[index],
              patientname: patientnamearr[index],
              approvalamount: approvalamountarr[index],
              pin: pinarr[index],
              dob: dobarr[index],
              aadhar: aadhararr[index],
              agreementstatus: agreementstatusarr[index],
              paymentstatus: paymentstatusarr[index],
              key: keyarr[index]
            }
          });
            const result = {
            code: 200,
            status: true,
            message:items,
            comment: commentarr.filter(el => {
                return el != null && el != '' && el != " ";
              })
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
