const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let paymentsSchema = new Schema({
    EID: {
        type: String,
    },
    paymentId: {
        type: String,
    },
    HID: {
        type: String,
    },
    amount: {
        type: Number,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hospitals",
    },
    payment_id: {
        type: String,
    },
    order_id: {
        type: String,
    },
    reason: {
        type: String,
    },
    status: {
        type: String,
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    razorpayPaymentLink: { type: String },
    linkSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
},

    {
        collection: 'payments'
    })

module.exports = mongoose.model('Payments', paymentsSchema)