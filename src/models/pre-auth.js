const { servicenetworking } = require('googleapis/build/src/apis/servicenetworking');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PreAuth = new Schema({
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hospitals",
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      legalityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Legality",
      },
  
      insurer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "insurance_companies",
      },
  
      HID: { type: String },
      EID: { type: String },
      treatingDoctor: {
        qualification: { type: String },
        registrationNumber: { type: String },
        name: { type: String },
        age: { type: String },
        dob: { type: String },
        gender: { type: String },
        contactNumber: { type: String },
        illnessNature: { type: String },
        relevantCriticalFinding: { type: String },
        presentAilmentDuration: { type: String },
        presentAilmentDurationDate: { type: String },
        pastHistoryofPresentAilment: {
          type: String,
          default: null,
        },
        provisionalDiagnosis: { type: String },
        ICD_10_code: { type: String },
  
        proposedLineOfTreatment: [{ type: String }],
        medicalManagementDetails: {
          type: Boolean,
          deafult: false,
        },
        drugAdministrationRoute: { type: String },
  
        ifSurgical: { type: Boolean, default: false },
        surgeryName: { type: String },
        ICD_10_PCS_code: { type: String },
        otherTreatmentDetails: { type: Boolean, default: false },
        howInjuryOccured: { type: String },
        isAccidentCase: { type: Boolean, default: false },
        accidentCaseDetails: {
          is_RTA: { type: Boolean, default: false },
          rtaDate: { type: String, default: null },
          policeReport: { type: Boolean, default: null },
          firNumber: { type: String, default: null },
          caused_due_to_substanceAbuse_or_alcoholConsumption: {
            type: Boolean,
            default: false,
          },
          is_test_conducted_to_establish_this: { type: Boolean, default: false },
          test_conducted_to_establish_report: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Uploads",
          },
        },
  
        isMaternityCase: { type: Boolean, default: false },
        maternityStatus: { type: String },
        expectedDeliveryDate: { type: String },
      },
      ////////////////////Email verification
      signedBy: [
        {
          email: { type: String },
          status: { type: Boolean, default: false },
          name: { type: String },
          phone: { type: String },
        },
      ],
      attendingRelativeContactNumber: {
        type: String,
        default: null,
      },
      PID: { type: String },
      insurance_img: { type: String },
  
      insuredCardIdNumber: {
        type: String,
        default: null,
      },
      policyNumber: {
        type: String,
        require: true,
      },
      corporateName: {
        type: String,
        default: null,
      },
      corporateId: {
        type: String,
        default: null,
      },
      employeeId: {
        type: String,
        default: null,
      },
      otherMedicalOrHealthInsurance: {
        type: Boolean,
        default: false,
      },
      familyPhysician: {
        has: {
          type: Boolean,
          default: false,
        },
        name: {
          type: String,
          default: null,
        },
        contactNumber: {
          type: String,
          default: null,
        },
      },
      insuredPatientAddress: {
        type: String,
        default: null,
      },
      insuredPatientOccupation: {
        type: String,
        default: null,
      },
      presentAilmentPastHistory: {
        type: String,
        default: null,
      },
      patientAdmitted: {
        admissionTime: { type: String },
        admissionDate: { type: String },
        isEmergency: { type: Boolean, default: false },
        pastHistoryofChoricIllness: { type: Boolean, default: false },
        chronicIlnessAdmissionDate: { type: Date },
  
        diseases: [
          {
            name: { type: String },
            dataofAdmission: { type: String },
            reason: { type: String },
          },
        ],
  
        stayInHospital: { type: String },
        daysInICU: { type: String },
        roomType: { type: String },
        roomType: { type: String },
        roomRent_ServiceCharge: { type: String },
        expectedCostofInvestigation: { type: String },
        ICUcharges: { type: String },
        OTcharges: { type: String },
        professionalFee: { type: String },
        medicines_Consumebles: { type: String },
        otherExpenses: { type: String },
        allCharges: { type: String },
        totalCost: { type: String },
      },
    from: {
        type: String,
    },
    createdAt: { type: Date, default: Date.now },

    updatedAt: { type: Date, default: Date.now },
},

    {
        collection: 'preauths'
    })

module.exports = mongoose.model('PreAuth', PreAuth)