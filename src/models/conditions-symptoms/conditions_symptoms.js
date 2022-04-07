const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const symptoms = new Schema({
	conditionId: Number,
	conditionName: String,
	symptoms: {
		type: Array,
	},
});

const Symptoms = mongoose.model(
	"Symptoms",
	symptoms,
	"Conditions-Symptoms Tracker"
);
module.exports = Symptoms;
