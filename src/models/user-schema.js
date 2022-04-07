const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
	name: {
		type: String,
	},
	gender: {
		type: String,
	},
	email: {
		type: String,
		lowercase: true,
	},
	mobile: {
		type: Number,
	},
	age: {
		type: Number,
	},	
	created_date : { type : Date, default: Date.now },	
	
	modified_date : { type : Date, default: Date.now },
}, 

{
        collection: 'user_info'
    })

module.exports = mongoose.model('User', userSchema)