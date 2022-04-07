const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SalesSchema = new Schema({

	username: {
		type: String
	},

	password: {
		type: String
	},

},

{
	collection: 'sales'
})

module.exports = mongoose.model('SalesSchema', SalesSchema)