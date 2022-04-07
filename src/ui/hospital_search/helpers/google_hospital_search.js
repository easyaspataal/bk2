const { Keys } = require("../configuration/config");
const fetch = require("node-fetch");
const UnverifiedHospitals = require("../../../models/hospitals/unverified_hospitals_model");
const options = {
	redirect: "follow",
};

const photofetcher = async (photos) => {
	return new Promise(async (resolve, reject) => {
		let photosArray = [];
		for (let j = 0; j < 1; j++) {
			const url3 =
				"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" +
				photos[j].photo_reference +
				"&key=" +
				process.env.PlacesApi;
			const fetchRes = await fetch(url3, options);

			await photosArray.push(fetchRes.url);
		}
		resolve(photosArray);
	});
};

/* ------------------------------------------------------------------------------------------------------------------ */

const individualDetails = async (placeids) => {
	return new Promise(async (resolve, reject) => {
		let unverfiedList = [];
		console.log(placeids.length);
		for (let i = 0; i < placeids.length; i++) {
			const results = await UnverifiedHospitals.find({
				placeId: placeids[i],
			});
			if (results.length > 0) {
				for (
					let resultpointer = 0;
					resultpointer < results.length;
					resultpointer++
				) {
					const unverified_hospital_to_show_db = {
						placeId: results[resultpointer].placeId,
						name: results[resultpointer].name,
						city: results[resultpointer].city,
						address: results[resultpointer].address,
						state: results[resultpointer].state,
						latitude: results[resultpointer].latitude,
						longitude: results[resultpointer].longitude,
						phone: results[resultpointer].phone,
						images: results[resultpointer].images,
						visitorExperience:
							results[resultpointer].visitorExperience,
					};
					unverfiedList.push(unverified_hospital_to_show_db);
				}
			} else {
				const url2 =
					"https://maps.googleapis.com/maps/api/place/details/json?place_id=" +
					placeids[i] +
					"&key=" +
					process.env.PlacesApi;
				console.log(url2);
				const fetchRes = await fetch(url2, options).then((res) =>
					res.json()
				);
				//console.log(fetchRes);
				let photosList = [];
				let cityName;
				let phoneNumber = [];
				let reviews = [];

				if (fetchRes.result.photos) {
					photosList = await photofetcher(fetchRes.result.photos);
				} else {
					photosList.push(process.env.DEFAULT_UNVERIFIED_HOSPITAL_LOGO);
				}
				if (fetchRes.result.formatted_phone_number) {
					phoneNumber.push(fetchRes.result.formatted_phone_number);
				}

				let addressLength = fetchRes.result.address_components.length;
				for (let i = 0; i < addressLength; i++) {
					if (
						fetchRes.result.address_components[i].types[0] ===
						"locality"
					) {
						cityName =
							fetchRes.result.address_components[i].long_name;
						break;
					}
				}

				if (fetchRes.result.reviews) {
					reviews = fetchRes.result.reviews;
				}
				let modified_visitor_exp = [];
				for (
					let review_pointer = 0;
					review_pointer < reviews.length;
					review_pointer++
				) {
					const vis_exp = {
						name: reviews[review_pointer].author_name,
						photo: reviews[review_pointer].profile_photo_url,
						rating: reviews[review_pointer].rating,
						reviewText: reviews[review_pointer].text,
					};
					modified_visitor_exp.push(vis_exp);
				}

				const newUVHospital = new UnverifiedHospitals({
					placeId: fetchRes.result.place_id,
					name: fetchRes.result.name,
					city: cityName,
					address: fetchRes.result.formatted_address,
					state:
						fetchRes.result.address_components[addressLength - 3]
							.long_name,
					latitude: fetchRes.result.geometry.location.lat,
					longitude: fetchRes.result.geometry.location.lng,
					phone: phoneNumber,
					images: photosList,
					visitorExperience: modified_visitor_exp,
				});
				await newUVHospital.save();
				unverfiedList.push(newUVHospital);
			}
		}
		resolve(unverfiedList);
	});
};

/* ------------------------------------------------------------------------------------------------------------------ */
/*                                   This Function Is Used To Get Places Api Results                                  */
/* ------------------------------------------------------------------------------------------------------------------ */

const googleVerify = async (latitude, longitude, Results) => {
	return new Promise(async (resolve, reject) => {
		try {
			let unverifiedList = {
				Next_Page_Token: "",
				List: [],
			};
			const placesurl =
				"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" +
				latitude +
				"," +
				longitude +
				"&radius=1500&type=hospital&key=" +
				Keys.PlacesApi +
				"";
			const fetchRes = await fetch(placesurl).then((fetchRes) =>
				fetchRes.json()
			);
			if (fetchRes.results.length == 0) {
				resolve(unverifiedList);
			} else {
				let placeids = [];
				for (let i = 0; i < fetchRes.results.length; i++) {
					placeids.push(fetchRes.results[i].place_id);
				}
				unverifiedList.List = await individualDetails(placeids);
				if (fetchRes.next_page_token) {
					unverifiedList.Next_Page_Token = fetchRes.next_page_token;
				} else {
					unverifiedList.Next_Page_Token = "";
				}
				console.log(unverifiedList);
				resolve(unverifiedList);
			}
		} catch (error) {
			console.log(error);
		}
	});
};

module.exports = googleVerify;
