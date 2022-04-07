const userSchema = require('../../../models/user-schema');
const patientSchema = require('../../../models/patient-info-schema');
const patientHealthSchema = require('../../../models/patient-health-info-schema');
const paymentSchema = require('../../../models/payment-schema');
const insuranceSchema = require('../../../models/insurance-schema');
const bookingSchema = require('../../../models/booking-schema');

module.exports = {
    CreatePatient: async (req, res) => {
        try {
            const { name, email, mobile, age, purpose, type, hospitalid } = req.body;

            // Save User
            const saveuser = new userSchema({
                name: name,
                age: age,
                email: email,
                gender: '',
                mobile: mobile,
            });
            const savedUserDetails = await saveuser.save();

            // Save Patient
            const savepatient = new patientSchema({
                user_id: savedUserDetails._id,
                name: name,
                age: age,
                email: email,
                gender: '',
                mobile: mobile,
                relation_with_user: 'self',
                aadhar_no: '',
            });
            const savedPatientDetails = await savepatient.save();

            // Save Patient Health Details
            const savepatienthealth = new patientHealthSchema({
                patient_id: savedPatientDetails._id,
                purpose_of_visit: type,
                illness: purpose,
            });
            const savedPatientHealthDetails = await savepatienthealth.save();

            // Save Payment Details
            const savepayment = new paymentSchema({
                patient_id: savedPatientDetails._id,
                type: 'cash',
                status: 'Paid',
            });
            const savedPaymentDetails = await savepayment.save();

            // Save Booking Details
            const savebooking = new bookingSchema({
                patient_id: savedPatientDetails._id,
                booking_date: new Date(),
                hospital_id: hospitalid,
            });
            const savedBooking = await savebooking.save();
            res.json('Success')
        } catch (error) {
            console.log(error);
        }
    },
};
