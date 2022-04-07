const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ayush = new Schema({
	ayushId: Number,
	ayushName: String,
});

// Create a model.
/*
Structure - mongoose.model((unique name of schema), (schema to be used), (Collection name which will appear in mongodb) )
*/
const Ayush = mongoose.model("Ayush", ayush, "Ayush-List");

module.exports = Ayush;
