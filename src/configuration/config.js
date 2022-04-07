/*
 ************************************************************************************************
 ************************     This file should containes all the keys     ************************
 ************************   This file should not be uploaded anywhere   *************************
 ************************************************************************************************
 */

/*
Points to be noted when deploying
1)Always check frontend url

2)If backend url is being changed always add the update authorised url in Gcloud.
  Path - APIs and services -> Credentials -> Web clients -> Authorised redirect uris.
  URI to be added - ${new backend url}/users/oauth/google/redirect and ${new backend url}/users/oauth/facebook/redirect 
  
3)Change EXPRESS_SECRET,JWT_SECRET AND JWT_RESET Keys regularly.These are the secrets created by us.

*/

module.exports = {
	Keys: {
		SENDER_EMAIL_ADDRESS: "support@codemischief.io",
		INSURANCE_RECEIVER_EMAIL: "info@easyaspataal.com",
		HOSPITAL_SIGNUP_RECEIVER_EMAIL: "info@easyaspataal.com",
		EXPRESS_SECRET:
			"ER88e5usC8ZWXLndpWz4yafC8TGv3ZEdQmZnJPw9BqtJaN3h6QFk9tuWKHJK",
		// FRONTEND_REDIRECT_URL: "http://localhost:3000",
		FRONTEND_REDIRECT_URL: "https://uin-gwli64osaq-el.a.run.app",
		JWT_SECRET:
			"38CC6D93641729F96946C9F1FC681DEB712870D2A62EE1BC7F3013B3BD07F48D",
		JWT_RESET:
			"AD83C99B891F4E03833C5541EE7ED088A60C363F291924B9FB4CB70891341421",
		SENDGRID_API_KEY:
			"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",
		TWO_FACTOR_API_KEY: "31810b7e-eb59-11ea-9fa5-0200cd936042",
		Google: {
			Client_Id:
				"562040257469-1m4pnn5542mrt829s3i8ffh557mf8rrc.apps.googleusercontent.com",
			Secret: "ObqL45xAI9GXW_paHsILGW38",
		},
		Facebook: {
			Client_Id: "1632462823594905",
			Secret: "6899914b8bf44475b8d03f08c59c2150",
		},
		PlacesApi: "AIzaSyDIiwYqkwWNCA7Gw9cMN8tMrS2nK4R7fg8",
		GOOGLE_STORAGE_URL: "https://storage.googleapis.com",
		MongodbURI:
			"mongodb://powerfulp:hammer@34.106.31.188:27017/HS2?authSource=admin",
			// "mongodb://localhost:27017/HS2",
		// MongodbURI:
		// 	"mongodb+srv://code_user:m7LvxvBRcHgNjpcm@cluster0.pymaq.gcp.mongodb.net/HospitalSchema?retryWrites=true&w=majority",
		HOSPITAL_ID_TRACKER: "hospitalId",
		BUCKET_HOSPITAL: "hos_img",
		BUCKET_USERS_PATIENTS: "patient_details",
		DEFAULT_UNVERIFIED_HOSPITAL_LOGO:
			// "https://storage.googleapis.com/ea-database/hos_img/unverified-hospitals-default-images/logo/defaultlogo.png",
			"https://console.cloud.google.com/storage/browser/ea-database/hos_img/unverified-hospitals-default-images/logo/defaultlogo.png",
		AUTHY_OTP_KEY: "lXtHqVLN2QbMNtAyHrA5hXMUJsCANZHj", //twilio
		HOSPITAL_REMARKS:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nibh elit, hendrerit sit amet maximus eget, viverra et elit. Maecenas maximus dui et mi dapibus vulputate. Vestibulum felis nunc, egestas",
		RAZOR_PAY_KEY_ID: "rzp_live_EiOGO0Sq8Wr4Ne",
		RAZOR_PAY_KEY_SECRET: "hm3TZJJgG7wArIgVihFbTo7z",
		LEEGALITY_AUTH_TOKEN:"OAaiLGXl1KxTSmCpqr0iH36guxubrmab",
		LEEGALITY_POST_CREATE_REQUEST:"https://app.leegality.com/api/v3.0/sign/request",
		LEEGALITY_PRIVATE_SALT:"lcUGfbxB8ahLu15Dr4RBlOzTTRDy4iYP"
	},
};
