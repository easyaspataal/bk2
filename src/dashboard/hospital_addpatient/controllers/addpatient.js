const userSchema = require('../../../models/user-schema');
const patientSchema = require('../../../models/patient-info-schema');
const patientHealthSchema = require('../../../models/patient-health-info-schema');
const paymentSchema = require('../../../models/payment-schema');
const insuranceSchema = require('../../../models/insurance-schema');
const bookingSchema = require('../../../models/booking-schema');

module.exports = {
    AddPatient: async (req, res) => {
        try {
            const { name, email, mobile, gender, age, purpose, illness, paymenttype, paymentstatus, aadhar, bookingdate, hospitalid } = req.body;

            // Save User
            const saveuser = new userSchema({
                name: name,
                age: age,
                email: email,
                gender: gender,
                mobile: mobile,
            });
            const savedUserDetails = await saveuser.save();

            // Save Patient
            const savepatient = new patientSchema({
                user_id: savedUserDetails._id,
                name: name,
                age: age,
                email: email,
                gender: gender,
                mobile: mobile,
                relation_with_user: 'self',
                aadhar_no: aadhar,
            });
            const savedPatientDetails = await savepatient.save();

            // Save Patient Health Details
            const savepatienthealth = new patientHealthSchema({
                patient_id: savedPatientDetails._id,
                purpose_of_visit: purpose,
                illness: illness,
            });
            const savedPatientHealthDetails = await savepatienthealth.save();

            // Save Payment Details
            const savepayment = new paymentSchema({
                patient_id: savedPatientDetails._id,
                type: paymenttype,
                status: paymentstatus,
            });
            const savedPaymentDetails = await savepayment.save();
            if (paymenttype === 'insurance') {
                const saveinsurance = new insuranceSchema({
                    patient_id: savedPatientDetails._id,
                    approval: 'Pending',
                    name: name,
                });
                const savedInsuranceDetails = await saveinsurance.save();
            }

            // Save Booking Details
            const savebooking = new bookingSchema({
                patient_id: savedPatientDetails._id,
                booking_date: bookingdate,
                hospital_id: hospitalid,
            });
            const savedBooking = await savebooking.save();
            res.json('Success')
        } catch (error) {
            console.log(error);
        }
    },
};

