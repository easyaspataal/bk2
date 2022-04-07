const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let EDesks = new Schema({
    EID: {
        type: String,
    },
    HID: {
        type: String,
    },
    userId: {
        type: Schema.Types.ObjectId,
    },
    hospitalId: {
        type: Schema.Types.ObjectId,
    },
    status: {
        type: String,
        default: "Pending",
    },
    requestInitiated: {
        pre_auth: { type: Boolean, default: false },
        payment: { type: Boolean, default: false },
        surgery: { type: Boolean, default: false },
        finance: { type: Boolean, default: false }
    },
    from: {
        type: String,
    },
    createdAt: { type: Date, default: Date.now },

    updatedAt: { type: Date, default: Date.now },
},

    {
        collection: 'edesks'
    })

module.exports = mongoose.model('EDesks', EDesks)