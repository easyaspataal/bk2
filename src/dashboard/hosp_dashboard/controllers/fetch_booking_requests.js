const bookingTable = require("../../../models/bookings/patient_bookings");
const bookingStatusTable = require("../../../models/bookings/booking_status");
const verifiedHospitals = require("../../../models/hospitals/verified_hospitals_model");
const userTable = require("../../../models/users/user_details_model");
const JWT = require("jsonwebtoken");
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");


// PRAYAG START 11-2-2020
// Get patient data for hospital dashboard from new database schema 

const newbookingTable = require("../../../models/booking-schema");
const patientDetail = require("../../../models/patient-info-schema");
const patientHealthDetail = require("../../../models/patient-health-info-schema");
const billingDetail = require("../../../models/hospital-billing-schema");
const PaymentTable = require("../../../models/payment-schema");
const PatientBillingTable = require("../../../models/billing-schema");

// PRAYAG END 11-2-2020



module.exports = {
	fetchBookingInfo: async (req, res) => {
		const token = req.headers.authorization;
		const { sub } = JWT.verify(token, process.env.JWT_SECRET);

		// PRAYAG START 11-2-2020
		// Get patient data for hospital dashboard from new database schema 
		const newbookingDetails = await newbookingTable.find({
			hospital_id: mongoose.Types.ObjectId(sub),
		});
		const FinalData = [];
		for (let i = 0; i < newbookingDetails.length; i++) {
			const PatientData = await patientDetail.findById(newbookingDetails[i].patient_id);
			const BookingData = await newbookingTable.findOne({
				patient_id: mongoose.Types.ObjectId(newbookingDetails[i].patient_id),
			});
			const PaymentData = await PaymentTable.findOne({
				patient_id: mongoose.Types.ObjectId(newbookingDetails[i].patient_id),
			});

			FinalData.push(
				{
					'_id': newbookingDetails[i].patient_id,
					'name': PatientData.name,
					'age': PatientData.age,
					'booking_date': BookingData.booking_date,
					'booking_status': BookingData.booking_status,
					'booking_id': BookingData._id,
					'payment_status': PaymentData.status,
				}
			)
		}

		const newbookingDetailsnew = await Promise.all(FinalData);

		const result = {
			Status: 1,
			Message: "Success",
			Result: newbookingDetailsnew,
		};

		res.status(200).json(result);

		// PRAYAG END 11-2-2020
	},


	fetchSelectedPatientInfo: async (req, res) => {
		const token = req.headers.authorization;
		const { sub } = JWT.verify(token, process.env.JWT_SECRET);
		const ID = req.query.ID;
		const SelectedDetails = await patientDetail.findById(ID);
		res.status(200).json(SelectedDetails);
	},

	UpdatePatientDetails: async (req, res, next) => {
		const { email } = req.body;
		const { password } = req.body;
		const salt = await bcrypt.genSalt(10);
		var hashpass = await bcrypt.hash(password, salt);
		var myquery = { email: email };
		var newvalues = { $set: { password: hashpass } };
		const ResetPass = await HospitalTable.updateOne(myquery, newvalues)
		res.status(200).json('Success');
	},


	fetchPatientBillingData: async (req, res, next) => {
		const ID = req.query.ID;
		const BillData = [];
		var subtotal = 0;

		const BookingCheck = await newbookingTable.findById(ID);

		const PatientData = await patientDetail.findById(BookingCheck.patient_id);

		const HospitalData = await verifiedHospitals.findById(BookingCheck.hospital_id);

		const PatientBillCheck = await PatientBillingTable.countDocuments({ booking_id: ID });
		if (PatientBillCheck > 0) {
			var savedpatient = 'y';
			const Invoiceno = await PatientBillingTable.findOne({booking_id: ID}).sort({ _id: -1 });
			if (Invoiceno.invoice_no === undefined){
				var invoice = '';
			}
			else{
				var invoice = '#' + Invoiceno.invoice_no;
			}

			if (Invoiceno.final === undefined){
				var final = 'n';
			}
			else{
				var final = Invoiceno.final;
			}
		}
		else {
			var savedpatient = 'n';
			var invoice = '';
			var final = 'n';
		}

		const HospitalBilling = await billingDetail.findOne();
		const HospitalServices = HospitalBilling.services;
		for (let i = 0; i < HospitalServices.length; i++) {
			if (savedpatient === 'y') {
				const CheckData = await PatientBillingTable.aggregate([
					{ "$match": { "booking_id": mongoose.Types.ObjectId(ID) } },
					{ $sort: { '_id': -1 } },
					{ $limit: 1 },
					{ "$unwind": '$particulars' },
					{
						"$match":
							{ "particulars.service_id": HospitalServices[i].id }
					}
				]);
				if (CheckData.length > 0) {
					var qty = CheckData[0].particulars.quantity;
					var price = CheckData[0].particulars.rate;
					var total = qty * price;
					subtotal += total;
				}
				else {
					var qty = 0;
					var price = HospitalServices[i].rate;
					var total = 0;
					subtotal += total;
				}
			}
			else {
				var qty = 0;
				var price = HospitalServices[i].rate;
				var total = 0;
				subtotal += total;
			}

			BillData.push(
				{
					'id': HospitalServices[i].id,
					'name': HospitalServices[i].name,
					'rate': price,
					'sgst': HospitalServices[i].sgst,
					'cgst': HospitalServices[i].cgst,
					'total': total,
					'quantity': qty,
				}
			)
		}

		const FinalData = {
			'name': PatientData.name,
			'age': PatientData.age,
			'hospitalname': HospitalData.name,
			'hospitaladdress': HospitalData.address,
			'hospitalphone1': HospitalData.phone1,
			'hospitalphone2': HospitalData.phone2,
			'services': BillData,
			'subtotal': subtotal,
			'invoiceno': invoice,
			'final': final,
		}
		res.status(200).json(FinalData);
	},


// Hospital Billing Details
// 15-3-2021 Prayag
fetchBillingData: async (req, res) => {
	const token = req.headers.authorization;
	const { sub } = JWT.verify(token, process.env.JWT_SECRET);

	const FinalData = [];

	const BookingDetails = await newbookingTable.find({hospital_id: mongoose.Types.ObjectId(sub)});

	for (let i = 0; i < BookingDetails.length; i++) {
		const BillingDetails = await PatientBillingTable.findOne({booking_id: BookingDetails[i]._id}).sort({ _id: -1 });
		if (BillingDetails === null || BillingDetails === undefined) {
			var invoice = '';
			var billdate = '';
		}		
		else {
			var invoice = BillingDetails.invoice_no;
			var billdate = BillingDetails.created_date;
		}
		const PatientDetail = await patientDetail.findById(BookingDetails[i].patient_id);
			FinalData.push(
				{
					'invoiceno': invoice,
					'name': PatientDetail.name,
					'date': billdate,
					'bookingid': BookingDetails[i]._id,
				}
			)

	}	
	res.status(200).json(FinalData);
},


// Hospital OPD Details
// 6-4-2021 Prayag
fetchHospitalData: async (req, res) => {

	const ID = req.query.ID;

	const HospitalData = await verifiedHospitals.findById(ID);

	res.status(200).json(HospitalData);
},



};
