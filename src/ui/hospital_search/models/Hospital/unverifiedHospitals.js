const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const visitorSchema = new Schema({
	name: {
		type: String,
		default: "",
	},
	photo: {
		type: String,
		default: "",
	},
	rating: {
		type: Number,
		default: 0,
	},
	reviewText: {
		type: String,
		default: "",
	},
});

const bedSchema = new Schema({
	bedType: String,
	photos: {
		type: Array,
		default: "",
	},
	pricePerDay: Number,
	amenities: {
		type: Array,
	},
	description: String,
	sharingBasis: String,
	bedsAvailable: Number,
});

const departmentSchema = new Schema({
	departmentName: String,
	description: String,
	doctorsList: [
		{
			name: String,
			image: String,
			qualification: String,
			email: String,
			phone: String,
		},
	],
});

const treatmentSchema = new Schema({
	treatmentName: String,
	facilitiesIncluded: {
		type: Array,
	},
	details: String,
	price: Number,
});

const hospitalSchema = new Schema({
	placeId: String,
	name: String,
	email: {
		type: String,
		default: "",
	},
	phone: {
		type: Array,
		default: [],
	},
	address: String,
	city: String,
	state: String,
	latitude: String,
	longitude: String,
	hospitalLogo: {
		type: String,
		default: "",
	},
	images: {
		type: Array,
		default: [],
	},
	website: {
		type: String,
		default: "",
	},
	shortDescription: {
		type: String,
		default: "",
	},
	detailedDescription: {
		type: String,
		default: "",
	},
	facilities: {
		type: Array,
		default: [],
	},
	rating: {
		one: {
			type: Number,
			default: 0,
		},
		two: {
			type: Number,
			default: 0,
		},
		three: {
			type: Number,
			default: 0,
		},
		four: {
			type: Number,
			default: 0,
		},
		five: {
			type: Number,
			default: 0,
		},
	},
	emergencyAvailable: {
		type: Boolean,
		default: "false",
	},
	visitorExperience: [visitorSchema],
	specialities: {
		type: Array,
		default: "",
	},
	totalBedsAvailable: {
		type: Number,
		default: 0,
	},
	hospitalBedCategories: [bedSchema],
	hospitalDepartment: [departmentSchema],
	treatmentPackages: [treatmentSchema],
	hospitalType: {
		type: String,
		default: "",
	},
	accreditation: {
		type: String,
		default: "",
	},
	hospRegistrationNumber: {
		type: String,
		default: "",
	},
	nodalOfficerDetails: {
		firstName: {
			type: String,
			default: "",
		},
		lastName: {
			type: String,
			default: "",
		},
		email: {
			type: String,
			default: "",
		},
		phone: {
			type: String,
			default: "",
		},
	},
	infrastructure: {
		totalBranches: {
			type: Number,
			default: 0,
		},
		totalBeds: {
			type: Number,
			default: 0,
		},
		totalDoctors: {
			type: Number,
			default: 0,
		},
		totalParamedicalStaff: {
			type: Number,
			default: 0,
		},
		avgPatientsPerDay: {
			type: Number,
			default: 0,
		},
		totalIcuBeds: {
			type: Number,
			default: 0,
		},
		totalVentilatorBeds: {
			type: Number,
			default: 0,
		},
	},
	hms: {
		isDeployed: {
			type: Boolean,
			default: false,
		},
		nameOfTech: {
			type: String,
			default: "",
		},
		nameOfVendor: {
			type: String,
			default: "",
		},
		systemHostingServices: {
			type: String,
			default: "",
		},
		isThirdPartyVendor: {
			type: Boolean,
			default: false,
		},
	},
});

const unverifiedHospitals = mongoose.model(
	"SearchUnverifiedHospitalSchema",
	hospitalSchema,
	"Unverified-Hospitals"
);

module.exports = unverifiedHospitals;
