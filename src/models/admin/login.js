const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AdminSchema = new Schema({

	username: {
		type: String
	},

	password: {
		type: String
	},

},

{
	collection: 'admin'
})

module.exports = mongoose.model('Admin', AdminSchema)