const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AgentLeads = new Schema({
    name: {
        type: String,
    },
    contact: {
        type: Number,
    },
    city: {
        type: String,
    },
    AID: {
        type: String,
    },
    type: {
        type: String,
    },

    created_date: { type: Date, default: Date.now },

    modified_date: { type: Date, default: Date.now },
},

    {
        collection: 'agent_leads'
    })

module.exports = mongoose.model('AgentLeads', AgentLeads)