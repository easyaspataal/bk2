const Cloud = require("@google-cloud/storage");
const path = require("path");
const serviceKey = path.join(__dirname, "./service_account.json");

const { Storage } = Cloud;
const storage = new Storage({
	keyFilename: serviceKey,
	projectId: "gleaming-lead-277215",
});

module.exports = storage;
