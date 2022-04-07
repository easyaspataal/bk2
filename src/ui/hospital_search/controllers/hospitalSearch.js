/* ------------------------------------------------------------------------------------------------------------------ */
/*                       This File Sets Up The Function That Returns The Hospital Search Results                      */
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Requirements -------------------------------------------------- */

const { Keys } = require("../configuration/config");
const { Storage } = require('@google-cloud/storage');
const fetch = require("node-fetch");
const Cities = require("../../../models/cities/city_model");
const VerifiedHospitals = require("../../../models/hospitals/verified_hospitals_model");
const AmenitiesListSchema = require("../../../models/hospitals/amenitiesList");
const SpecialitiesListSchema = require("../../../models/hospitals/specialitiesList");
const FacilitiesListSchema = require("../../../models/hospitals/facilitiesList");
const CitiesSchema = require("../../../models/cities/city_model");
const googleVerify = require("../helpers/google_hospital_search");
/* ------------------------------------------------------------------------------------------------------------------ */

const Results = {
	Verified: {
		List: [],
	},
	Unverified: {
		Next_Page_Token: "",
		List: [],
	},
};

const fetchVerifiedHospitals = async (cityName, speciality) => {
	return new Promise(async (resolve, reject) => {
		try {
			let SearchObject = {
				"hospitalAddress.city": cityName,
			};
			if (speciality) {
				SearchObject = {
					"hospitalAddress.city": cityName,
					specialities: speciality,
				};
			}
			let filterData = {
				specialities: 0,
				accreditation: 0,
				hospRegistrationNumber: 0,
				nodalOfficerDetails: 0,
				infrastructure: 0,
				hms: 0,
				supportEmail: 0,
				saveStage: 0,
				insuranceAvailable: 0,
				ayush: 0,
				insuranceTieups: 0,
				govtOrPvt: 0,
				hospitalType: 0,
				password: 0,
			};
			const verifiedHospitalsList = await VerifiedHospitals.find(
				SearchObject,
				filterData
			);
			resolve(verifiedHospitalsList);
		} catch (error) {
			console.log(error);
		}
	});
};

const cityExtractFunction = async (address) => {
	return new Promise(async (resolve, reject) => {
		try {
			const cityResults = await Cities.find({});
			let cityFound = 0;
			let foundcity;
			for (let i = 0; i < cityResults.length; i++) {
				if (address.includes(cityResults[i].city)) {
					console.log(cityResults[i].city + " is there in database");
					cityFound = 1;
					resolve(cityResults[i].city);
				}
			}
			resolve();
		} catch (error) {
			console.log(error);
		}
	});
};

/* ------------------------------------------------------------------------------------------------------------------ */

module.exports = {
	searchbylocation: async (req, res, next) => {
		try {
			let {
				latitude,
				longitude,
				speciality,
				city,
				hospitalIds,
			} = req.body;
			//Mumbai 19.0760 || 72.8777
			//Pune 18.5204 || 73.8567
			//Url to convert latitude and longitude to city name
			const cityFetchUrl =
				"https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
				latitude +
				"," +
				longitude +
				"&key=" +
				process.env.PlacesApi +
				"";
			//The output format
			let cityName = "";
			if (city) {
				cityName = city;
				const verifiedHospitalListFunction = await fetchVerifiedHospitals(
					cityName,
					speciality
				);
				//console.log(verifiedHospitalListFunction);
				Results.Verified.List = verifiedHospitalListFunction;
				const cityDetails = await Cities.findOne({ city: cityName });
				if (cityDetails) {
					Results.Unverified = await googleVerify(
						cityDetails.latitude,
						cityDetails.longitude,
						Results
					);
					const results = {
						Status: 1,
						Hospitals: Results,
					};
					res.status(200).json(results);
				} else {
					const results = {
						Status: 1,
						Hospitals: Results,
					};
					res.status(200).json(results);
				}
			} else if (hospitalIds) {
				console.log(hospitalIds);
				let filterData = {
					specialities: 0,
					accreditation: 0,
					hospRegistrationNumber: 0,
					nodalOfficerDetails: 0,
					infrastructure: 0,
					hms: 0,
					supportEmail: 0,
					saveStage: 0,
					insuranceAvailable: 0,
					ayush: 0,
					insuranceTieups: 0,
					govtOrPvt: 0,
					hospitalType: 0,
					password: 0,
				};
				const verifiedHospitalsList = await VerifiedHospitals.find(
					{ hospitalId: { $in: hospitalIds } },
					filterData
				);
				const Results = {
					Verified: {
						List: verifiedHospitalsList,
					},
				};
				const results = {
					Status: 1,
					Hospitals: Results,
				};
				res.status(200).json(results);
			} else {
				const fetchRes = await fetch(cityFetchUrl).then((fetchRes) =>
					fetchRes.json()
				);
				console.log(fetchRes.results.length);
				if (fetchRes.results.length == 0) {
					console.log("No such address exist. Try something else");
					throw "No such address exist. Try something else";
				}
				const address = fetchRes.results[0].formatted_address;
				cityName = await cityExtractFunction(address);
				console.log(cityName);
				if (cityName != undefined) {
					const verifiedHospitalListFunction = await fetchVerifiedHospitals(
						cityName,
						speciality
					);
					Results.Verified.List = verifiedHospitalListFunction;
				}
				Results.Unverified = await googleVerify(
					latitude,
					longitude,
					Results
				);
				const results = {
					Status: 1,
					Hospitals: Results,
				};
				res.status(200).json(results);
			}
		} catch (error) {
			console.log(error);
		}
	},

	searchByName: async (req, res) => {
		try {
			// Get Images from Bucket
			const projectId = 'eamigrate';
			const keyFilename = 'src/configuration/private_bucket_keys.json';
			const PrivateBucket = new Storage({ projectId, keyFilename });

			let FinalData = [];

			const hospitalsList = await VerifiedHospitals.find(
				{relationship: { $ne: '0' }},
				{ name: 1, hospitalId: 1, _id: 1, address: 1, relationship: 1, hospitalLogo: 1, absoluteRating: 1 }
			);


			const options2 = {
				version: 'v2', // defaults to 'v2' if missing.
				action: 'read',
				expires: Date.now() + 1000 * 60 * 60, // one hour
			};

				for (let i = 0; i < hospitalsList.length; i++) {

					const HospitalImages = [];
					const HospitalImagesUrls = [];
		
					const options = {
						prefix: 'hospitals/' + hospitalsList[i].name + '/',
					};
					const [files] = await PrivateBucket.bucket('main_pvt').getFiles(options);
					files.forEach(file => {
						HospitalImages.push(file.name);
					});
				
					for (let index = 0; index < HospitalImages.length; index++) {
						const url = await PrivateBucket
							.bucket('main_pvt')
							.file(HospitalImages[index])
							.getSignedUrl(options2);
						HospitalImagesUrls.push(url[0]);
					}
					FinalData.push({
						name: hospitalsList[i].name,
						address: hospitalsList[i].address,
						relationship: hospitalsList[i].relationship,
						hospitalLogo: hospitalsList[i].hospitalLogo,
						_id: hospitalsList[i]._id,
						absoluteRating: hospitalsList[i].absoluteRating,
						Images: HospitalImagesUrls,
					})
				}
			res.status(200).json(FinalData);
		} catch (error) {
			console.log(error);
			const result = {
				Status: 0,
				Message: "Error",
			};
			res.status(400).json(result);
		}
	},

	// Selected Hospital Details
	// 13-4-2021 Prayag
	SelectedHospital: async (req, res) => {
		try {
			const hospitalid = req.query.HospitalID;
			const SelectedHospitalData = await VerifiedHospitals.findById(hospitalid);

			const HospitalImages = [];
			const HospitalImagesUrls = [];

			// Get Images from Bucket
			const projectId = 'eamigrate';
			const keyFilename = 'src/configuration/private_bucket_keys.json';
			const PrivateBucket = new Storage({ projectId, keyFilename });
			const options = {
				prefix: 'hospitals/' + SelectedHospitalData.name + '/',
			};
			const [files] = await PrivateBucket.bucket('main_pvt').getFiles(options);
			files.forEach(file => {
				HospitalImages.push(file.name);
			});

			const options2 = {
				version: 'v2', // defaults to 'v2' if missing.
				action: 'read',
				expires: Date.now() + 1000 * 60 * 60, // one hour
			};

			for (let index = 0; index < HospitalImages.length; index++) {
				const url = await PrivateBucket
					.bucket('main_pvt')
					.file(HospitalImages[index])
					.getSignedUrl(options2);
				HospitalImagesUrls.push(url[0]);
			}

			const result = {
				Status: 1,
				Images: HospitalImagesUrls,
				HospitalDetail: SelectedHospitalData,
			};
			res.status(200).json(result);
		} catch (error) {
			console.log(error);
			res.status(400).json('Fail');
		}
	},

	// Get all Filters
	// 1-5-2021 Prayag
	GetAllFilters: async (req, res) => {
		try {
			const AmenitiesDetails = await AmenitiesListSchema.find();
			const SpecialitiesDetails = await SpecialitiesListSchema.find();
			const FacilitiesDetails = await FacilitiesListSchema.find();

			const result = {
				Status: 1,
				Amenities: AmenitiesDetails,
				Specialities: SpecialitiesDetails,
				Facilities: FacilitiesDetails,
			};
			res.status(200).json(result);
		} catch (error) {
			console.log(error);
			const result = {
				Status: 0,
				Message: "Error",
			};
			res.status(400).json(result);
		}
	},

	// Get Selected Filters
	// 2-5-2021 Prayag
	GetSelectedFilters: async (req, res) => {
		try {

			let AllData = [];

			if (req.body.Facilities.length > 0) {
				for (let i = 0; i < req.body.Facilities.length; i++) {
					const CheckFacilities = await VerifiedHospitals.find({ 'facilities': req.body.Facilities[i] }, function (err, system) {
						if (err) { console.log(err); }
						else { AllData.push(system); }
					});
				}
			}

			if (req.body.Specialities.length > 0) {
				for (let i = 0; i < req.body.Specialities.length; i++) {
					const CheckSpecialities = await VerifiedHospitals.find({ 'specialities': req.body.Specialities[i] }, function (err, system) {
						if (err) { console.log(err); }
						else {
							const found = AllData.some(el => el.name === system.name);
							if (!found) AllData.push(system);
						}
					});
				}
			}

			if (req.body.Amenities.length > 0) {
				for (let i = 0; i < req.body.Amenities.length; i++) {
					const CheckAmenities = await VerifiedHospitals.find({ 'amenities': req.body.Amenities[i] }, function (err, system) {
						if (err) { console.log(err); }
						else {
							const found = AllData.some(el => el.name === system.name);
							if (!found) AllData.push(system);
						}
					});
				}
			}

			if (req.body.Ratings.length > 0) {
				for (let i = 0; i < req.body.Ratings.length; i++) {
					await VerifiedHospitals.find({ absoluteRating: { $gt: req.body.Ratings[i] } }, function (err, products) {
						for (var i = 0; i < products.length; i++) {
							const found = AllData.some(el => el.name === products[i].name);
							if (!found) AllData.push(products);
						}
					});
				}
			}

			if (req.body.City !== '') {
				const CityHosp = await VerifiedHospitals.find({ city: req.body.City });
				for (let i = 0; i < CityHosp.length; i++) {
					const found = AllData.some(el => el.name === CityHosp[i].name);
					if (!found) AllData.push(CityHosp[i]);
				}

			}

			res.status(200).json(AllData[0]);
		} catch (error) {
			console.log(error);
			res.status(400).json('Error');
		}
	},


	// Get all Cities
	// 2-5-2021 Prayag
	GetAllCities: async (req, res) => {
		try {
			const CitiesDetails = await CitiesSchema.find();
			res.status(200).json(CitiesDetails);
		} catch (error) {
			console.log(error);
			const result = {
				Status: 0,
				Message: "Error",
			};
			res.status(400).json(result);
		}
	},



};
