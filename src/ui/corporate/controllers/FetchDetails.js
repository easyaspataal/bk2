/* ----------------- This File Gets Data for Corporate ----------------- */
/* ----------------- Created : 3-6-2021 by Prayag ----------------- */
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Schemas -------------------------------------------------- */
const CorporateSchema = require("../../../models/corporate");
const UsersSchema = require("../../../models/users");
const RequestVaccinationSchema = require("../../../models/requests-vaccination");
const EmployeesSchema = require("../../../models/employees");
const KYCSchema = require("../../../models/requests-kyc");
const RequestSurgerySchema = require("../../../models/requests-surgery");
const RequestEstimationSchema = require("../../../models/requests-estimation");
const RequestEMISchema = require("../../../models/requests-emi");
const CreditsSchema = require("../../../models/credits");
/* ------------------------------------------------------------------------------------------------------------------ */


module.exports = {
    // Corporate Login
    // 3-6-2021 Prayag
    Login: async (req, res) => {
        try {
            const email = req.body.email;
            const password = req.body.password;

            const CorporateCheck = await CorporateSchema.findOne({
                email: email.toLowerCase(),
            });
            if (CorporateCheck === null) {
                const result = {
                    code: 400,
                    status: false,
                    message: 'Corporate does not exist'
                }
                res.json(result);
            } else {
                const isMatch = await bcrypt.compare(password, CorporateCheck.password);
                if (!isMatch) {
                    const result = {
                        code: 400,
                        status: false,
                        message: 'Wrong Password'
                    }
                    res.json(result);
                }
                else {
                    const result = {
                        code: 200,
                        status: true,
                        message: CorporateCheck
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


    // Selected Users Details
    // 10-6-2021 Prayag
    getUser: async (req, res) => {
        try {
            const eid = req.query.eid;
            const SelectedUser = await UsersSchema.findOne({ EID: eid });
            const CorporateDetails = await CorporateSchema.findById(SelectedUser.corporate_id);
            const KYCDetails = await KYCSchema.findOne({ EID: SelectedUser.EID });
            const VaccinationDetails = await RequestVaccinationSchema.findOne({ corporate_id: SelectedUser.corporate_id });
            const CreditsDetails = await CreditsSchema.findOne({ EID: SelectedUser.EID });
            const EMIDetails = await RequestEMISchema.findOne({ EID: SelectedUser.EID });

            if (SelectedUser.relations.length > 0) {
                var RelationArr = [];
                for (let index = 0; index < SelectedUser.relations.length; index++) {
                    const RelationsData = await UsersSchema.findOne({ EID: SelectedUser.relations[index].EID });
                    RelationArr.push(RelationsData);
                }
            }
            
            if (CreditsDetails == null || CreditsDetails == '') {
                var cardstatus = 'pending';
                var caramount = 0;
            }
            else {
                var cardstatus = CreditsDetails.status;
                var caramount = CreditsDetails.cover_amount;
            }
            const result = {
                code: 200,
                status: true,
                UserData: SelectedUser,
                Relations: RelationArr,
                KYCData: KYCDetails,
                VaccinationData: VaccinationDetails,
                CorporateData: CorporateDetails,
                EMIData: EMIDetails,
                CardStatus: cardstatus,
                CardAmount: caramount,
            };

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


    // Selected Corporate Users Details
    // 10-6-2021 Prayag
    getCorporate: async (req, res) => {
        try {
            const id = req.query.id;

            const CorporateVaccination = await RequestVaccinationSchema.findOne({ corporate_id: id });
            const CorporateHealthCover = await EmployeesSchema.countDocuments({ corporate_id: id });
            const CorporateData = await CorporateSchema.findById(id);

            const result = {
                code: 200,
                status: true,
                CorporateDetails: CorporateData,
                VaccinationData: CorporateVaccination,
                HealthCoverData: CorporateHealthCover,
            };
            res.json(result);
        } catch (error) {
            const result = {
                code: 400,
                status: false,
                CorporateDetails: error,
                VaccinationData: error,
                HealthCoverData: error,
            }
            res.json(result);
            console.log(error);
        }
    },


    // Selected User Requests Data
    // 30-6-2021 Prayag
    getUserRequests: async (req, res) => {
        try {
            const eid = req.query.eid;

            var FinalDisbursement = [];
            var FinalSurgery = [];
            var FinalEMI = [];

            const DisbursementsDetails = await RequestSurgerySchema.find({ EID: eid });
            const EMIDetails = await RequestEMISchema.find({ EID: eid });
            const SurgeryDetails = await RequestEstimationSchema.find({ EID: eid });

            for (let index = 0; index < DisbursementsDetails.length; index++) {
                const UserData = await UsersSchema.findOne({ EID: DisbursementsDetails[index].EID });
                FinalDisbursement.push({
                    surgery: DisbursementsDetails[index].surgery,
                    estimated_cost: DisbursementsDetails[index].estimated_cost,
                    hospital_name: DisbursementsDetails[index].hospital_name,
                    hospital_contact: DisbursementsDetails[index].hospital_contact,
                    hospital_pincode: DisbursementsDetails[index].hospital_pincode,
                    type: DisbursementsDetails[index].type,
                    ID: DisbursementsDetails[index].ID,
                    created_date: DisbursementsDetails[index].created_date,
                    name: UserData.name,
                    age: UserData.age,
                    gender: UserData.gender,
                    email: UserData.email,
                    mobile: UserData.cmobile,
                    relation: UserData.relation,
                    status: DisbursementsDetails[index].status,
                })
            }

            for (let index = 0; index < SurgeryDetails.length; index++) {
                const UserData = await UsersSchema.findOne({ EID: SurgeryDetails[index].EID });
                FinalSurgery.push({
                    budget: SurgeryDetails[index].budget,
                    treatment: SurgeryDetails[index].treatment,
                    city: SurgeryDetails[index].city,
                    finance: SurgeryDetails[index].finance,
                    insurance: SurgeryDetails[index].insurance,
                    created_date: SurgeryDetails[index].created_date,
                    name: UserData.name,
                    age: UserData.age,
                    gender: UserData.gender,
                    email: UserData.email,
                    mobile: UserData.cmobile,
                    relation: UserData.relation,
                    status: SurgeryDetails[index].status,
                })
            }

            for (let index = 0; index < EMIDetails.length; index++) {
                const UserData = await UsersSchema.findOne({ EID: EMIDetails[index].EID });
                FinalEMI.push({
                    total_amount: EMIDetails[index].budget,
                    tenure_in_months: EMIDetails[index].tenure_in_months,
                    expiry_date: EMIDetails[index].expiry_date,
                    emi_amount: EMIDetails[index].emi_amount,
                    name: UserData.name,
                    age: UserData.age,
                    gender: UserData.gender,
                    email: UserData.email,
                    mobile: UserData.cmobile,
                    relation: UserData.relation,
                    status: EMIDetails[index].status,
                })
            }

            const result = {
                code: 200,
                status: true,
                EMIData: FinalEMI,
                DisbursementData: FinalDisbursement,
                SurgeryData: FinalSurgery,
            };
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


    // Selected User Credits Data
    // 16-7-2021 Prayag
    UserCredits: async (req, res) => {
        try {
            const eid = req.query.eid;

            const CreditsData = await CreditsSchema.findOne({ EID: eid });

            const result = {
                code: 200,
                status: true,
                message: CreditsData,
            };
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


    // Selected User Vaccination Details
    // 28-7-2021 Prayag
    UserVaccinationData: async (req, res) => {
        try {
            const eid = req.query.eid;

            const UserData = await UsersSchema.findOne({ EID: eid });

            const VaccinationData = await RequestVaccinationSchema.findOne({ corporate_id: UserData.corporate_id })

            const result = {
                code: 200,
                status: true,
                message: VaccinationData,
            };
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


    // Selected User Dependent Details
    // 28-7-2021 Prayag
    UserDependentData: async (req, res) => {
        try {
            const eid = req.query.eid;

            const SelectedUser = await UsersSchema.findOne({ EID: eid });

            if (SelectedUser.relations.length > 0) {
                var RelationArr = [];
                for (let index = 0; index < SelectedUser.relations.length; index++) {
                    const RelationsData = await UsersSchema.findOne({ EID: SelectedUser.relations[index].EID });
                    RelationArr.push(RelationsData);
                }
            }

            const result = {
                code: 200,
                status: true,
                message: RelationArr,
            };
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


    // Selected User KYC Details
    // 28-7-2021 Prayag
    UserKYCData: async (req, res) => {
        try {
            const eid = req.query.eid;

            const KYCData = await KYCSchema.findOne({ EID: eid });

            const result = {
                code: 200,
                status: true,
                message: KYCData,
            };
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
