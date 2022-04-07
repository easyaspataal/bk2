const { binary } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let blogSchema = new Schema({
    title: {
        type: String,
    },

    content: {
        type: String,
    },    
	created_date : { type : Date, default: Date.now },	
}, 

{
        collection: 'blogs'
    })

module.exports = mongoose.model('BlogDetails', blogSchema)